'use client';

import { useEffect, useState } from 'react';
import { useNewUserContext } from '@/app/context/NewUserContext';
import { useRouter} from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  ShoppingBag, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCartContext } from '@/app/context/CartContext';

export default function CartClient({id}) {
  const { newUser } = useNewUserContext();
  const { currentSupplierId, cart, clearCart } = useCartContext();
  const router = useRouter();
  const { toast } = useToast();
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingItems, setProcessingItems] = useState({});
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [expandedCart, setExpandedCart] = useState(null);
  const [hasCurrentSupplier, setHasCurrentSupplier] = useState(false);

  // Fetch all carts for the client
  useEffect(() => {
    const fetchCarts = async () => {
      // If we already have cart data from context, use that instead of fetching again
      if (cart) {
        setCarts([cart]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        if (!newUser || !newUser._id) {
          setLoading(false);
          setCarts([]);
          return;
        }
        
        // Get the supplier ID from URL query parameter or from context
        
        // Try to get supplier ID from different sources
        let currentSupplierId = id;
        
        
        // Set flag based on whether we have a supplier ID
        if (currentSupplierId) {
          setHasCurrentSupplier(true);
        } else {
          setHasCurrentSupplier(false);
        }
        
        const response = await fetch(`/api/carts?clientId=${newUser._id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }
        const data = await response.json();
        
        // Get all carts
        const allCarts = data.carts || [];
        
        // Filter carts to only show the current supplier's cart if we have a supplier ID
        let filteredCarts = allCarts;
        if (currentSupplierId) {
          filteredCarts = allCarts.filter(cart => {
            const cartSupplierId = typeof cart.supplierId === 'object' 
              ? cart.supplierId._id 
              : cart.supplierId;
            return cartSupplierId === currentSupplierId;
          });
          
          // If we have a supplier ID but no matching cart, show empty state with supplier selected
          if (filteredCarts.length === 0) {
            setHasCurrentSupplier(true);
          }
        } else if (allCarts.length > 0) {
          // If we don't have a current supplier but have carts, show a message
          // but don't display any carts
          filteredCarts = [];
          
          // We still set hasCurrentSupplier to false to show the "select a supplier" message
          setHasCurrentSupplier(false);
          
          // Show a toast notification to inform the user
          toast({
            title: 'נדרשת בחירת ספק',
            description: 'יש לך עגלות מספקים שונים. אנא בחר ספק ספציפי כדי לצפות בעגלה שלו.',
          });
        }
        
        // We're only showing one cart per supplier, so we'll use the carts as they come
        setCarts(filteredCarts);
        
        // If there are multiple carts (which shouldn't happen in the new design),
        // we'll log a warning but still display them
        if (filteredCarts.length > 1) {
          console.warn('Multiple supplier carts found. The system is designed for one supplier cart at a time.');
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast({
          title: 'שגיאה בטעינת העגלה',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCarts();
  }, [newUser, id, cart, toast]);

  // Handle quantity change with debounce
  const handleQuantityChange = async (cartIndex, itemIndex, newQuantity) => {
    const cart = carts[cartIndex];
    const item = cart.items[itemIndex];
    const productId = item.productId._id;
    const supplierId = typeof cart.supplierId === 'object' ? cart.supplierId._id : cart.supplierId;
    
    // Don't allow quantities less than 1
    if (newQuantity < 1) return;
    
    // Check if the product has enough stock
    const maxAvailable = item.productId.stock;
    if (newQuantity > maxAvailable) {
      toast({
        title: 'כמות לא זמינה',
        description: `הכמות המקסימלית הזמינה היא ${maxAvailable}`,
        variant: 'destructive',
      });
      return;
    }

    // Update local state immediately for responsive UI
    const updatedCarts = [...carts];
    updatedCarts[cartIndex].items[itemIndex].quantity = newQuantity;
    setCarts(updatedCarts);

    // Mark this item as processing
    setProcessingItems(prev => ({
      ...prev,
      [`${cart._id}-${productId}`]: true
    }));

    try {
      // Update the cart in the database
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: newUser._id,
          supplierId: supplierId,
          productId,
          quantity: newQuantity
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      // Update the total price
      const updatedCart = updatedCarts[cartIndex];
      updatedCart.totalPrice = calculateCartTotal(updatedCart);
      setCarts(updatedCarts);
      
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'שגיאה בעדכון הכמות',
        description: error.message,
        variant: 'destructive',
      });
      
      // Revert to the previous quantity on error
      const revertedCarts = [...carts];
      revertedCarts[cartIndex].items[itemIndex].quantity = item.quantity;
      setCarts(revertedCarts);
    } finally {
      // Remove the processing state
      setProcessingItems(prev => ({
        ...prev,
        [`${cart._id}-${productId}`]: false
      }));
    }
  };

  // Handle item removal
  const handleRemoveItem = async (cartIndex, itemIndex) => {
    const cart = carts[cartIndex];
    const item = cart.items[itemIndex];
    const productId = item.productId._id;
    const supplierId = typeof cart.supplierId === 'object' ? cart.supplierId._id : cart.supplierId;

    // Mark this item as processing
    setProcessingItems(prev => ({
      ...prev,
      [`${cart._id}-${productId}`]: true
    }));

    try {
      // Remove from the database
      const response = await fetch(`/api/cart?clientId=${newUser._id}&supplierId=${supplierId}&productId=${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      // Update local state
      const updatedCarts = [...carts];
      updatedCarts[cartIndex].items.splice(itemIndex, 1);
      
      // If cart is empty, remove it and clear cart context
      if (updatedCarts[cartIndex].items.length === 0) {
        updatedCarts.splice(cartIndex, 1);
        // Clear cart in context when last item is removed
        try {
          await clearCart(newUser._id, supplierId);
        } catch (error) {
          console.error('Error clearing cart context:', error);
        }
      } else {
        // Update the total price
        updatedCarts[cartIndex].totalPrice = calculateCartTotal(updatedCarts[cartIndex]);
      }
      
      setCarts(updatedCarts);
      
      toast({
        title: 'פריט הוסר',
        description: 'הפריט הוסר מהעגלה בהצלחה',
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: 'שגיאה בהסרת הפריט',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      // Remove the processing state
      setProcessingItems(prev => ({
        ...prev,
        [`${cart._id}-${productId}`]: false
      }));
    }
  };

  // Handle cart deletion
  const handleDeleteCart = async (cartIndex) => {
    const cart = carts[cartIndex];
    const supplierId = typeof cart.supplierId === 'object' ? cart.supplierId._id : cart.supplierId;
    
    try {
      const response = await fetch(`/api/cart/delete?clientId=${newUser._id}&supplierId=${supplierId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete cart');
      }

      // Update local state
      const updatedCarts = [...carts];
      updatedCarts.splice(cartIndex, 1);
      setCarts(updatedCarts);
      
      // Clear cart in context
      try {
        await clearCart(newUser._id, supplierId);
      } catch (error) {
        console.error('Error clearing cart context:', error);
      }
      
      toast({
        title: 'העגלה נמחקה',
        description: 'העגלה נמחקה בהצלחה',
      });
    } catch (error) {
      console.error('Error deleting cart:', error);
      toast({
        title: 'שגיאה במחיקת העגלה',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (carts.length === 0) return;
    
    // Since we're only dealing with one supplier's cart, we can use the first cart
    const cart = carts[0];
    const supplierId = typeof cart.supplierId === 'object' ? cart.supplierId._id : cart.supplierId;
    
    setSubmittingOrder('all');
    
    try {
      // Submit the order for this supplier
      const response = await fetch('/api/cart/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: newUser._id,
          supplierId: supplierId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit order');
      }
      
      // Clear the cart from the context
      await clearCart(newUser._id, supplierId);
      
      // Order submitted successfully
      toast({
        title: 'ההזמנה נשלחה בהצלחה',
        description: 'ההזמנה נוספה לרשימת ההזמנות שלך',
      });
      
      // Redirect to orders page after successful submission
      router.push('/orders');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: 'שגיאה בשליחת ההזמנה',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmittingOrder(null);
    }
  };

  // Calculate cart total
  const calculateCartTotal = (cart) => {
    return cart.items.reduce((total, item) => {
      return total + (item.productId.price * item.quantity);
    }, 0);
  };

  // Calculate total items in the cart
  const totalItems = carts.length > 0 
    ? carts[0].items.reduce((total, item) => total + item.quantity, 0)
    : 0;

  // Add a helper function to get the image URL
  const getImageUrl = (product) => {
    if (!product) return '/no-image.jpg';
    
    // Check if imageUrl is an object with secure_url
    if (product.imageUrl && typeof product.imageUrl === 'object' && product.imageUrl.secure_url) {
      return product.imageUrl.secure_url;
    }
    
    // Check if imageUrl is a string
    if (product.imageUrl && typeof product.imageUrl === 'string') {
      return product.imageUrl;
    }
    
    return '/no-image.jpg';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 pb-24 md:pb-16">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <span>העגלה שלי</span>
        </h1>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-customBlue mb-4" />
          <p className="text-gray-500">טוען את העגלה שלך...</p>
        </div>
      </div>
    );
  }

  if (!newUser) {
    return (
      <div className="container mx-auto p-4 pb-24 md:pb-16">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <span>העגלה שלי</span>
        </h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="bg-gray-100 p-4 rounded-full">
              <AlertCircle className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold">התחבר כדי לצפות בעגלה שלך</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              עליך להתחבר כדי לצפות בעגלת הקניות שלך ולהמשיך בתהליך הרכישה.
            </p>
            <Link
              href="/sign-in"
              className="px-6 py-3 bg-customBlue text-white rounded-md hover:bg-blue-600 transition flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>התחבר</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (newUser.role !== 'client') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-2">גישה מוגבלת</h2>
        <p className="text-gray-600 mb-6">רק לקוחות יכולים לצפות בעגלת הקניות</p>
        <Link 
          href="/newprofile" 
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          חזרה לפרופיל
        </Link>
      </div>
    );
  }

  if (carts.length === 0) {
    return (
      <div className="container mx-auto p-4 pb-24 md:pb-16">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <span>העגלה שלי</span>
          <span className="text-sm font-normal text-gray-500">({totalItems} פריטים)</span>
        </h1>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="bg-gray-100 p-4 rounded-full">
              <ShoppingCart className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold">
              {hasCurrentSupplier ? "העגלה שלך ריקה" : "לא נבחר ספק"}
            </h2>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              {hasCurrentSupplier 
                ? "לא נמצאו פריטים בעגלה שלך. בחר ספק והוסף מוצרים לעגלה."
                : "עליך לבחור ספק תחילה כדי לצפות בעגלה שלך. חזור לפרופיל ובחר ספק."}
            </p>
            <Link
              href={newUser ? "/newprofile" : "/catalog"}
              className="px-6 py-3 bg-customBlue text-white rounded-md hover:bg-blue-600 transition flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>חזרה לבחירת ספק</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-24 md:pb-16">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ShoppingCart className="h-6 w-6" />
        <span>העגלה שלי</span>
        <span className="text-sm font-normal text-gray-500">({totalItems} פריטים)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {carts.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span>{carts[0].supplierId.businessName}</span>
                </h2>
                <button
                  onClick={() => handleDeleteCart(0)}
                  disabled={submittingOrder === 'all'}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              
              <div className="divide-y">
                {carts[0].items.map((item, itemIndex) => (
                  <div key={item.productId._id} className="py-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 relative flex-shrink-0">
                        <Image
                          src={getImageUrl(item.productId)}
                          alt={item.productId.name || 'Product image'}
                          fill
                          className="object-contain rounded-md"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium">{item.productId.name}</h3>
                        <p className="text-gray-500 text-sm">₪{item.productId.price}</p>
                        
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(0, itemIndex, item.quantity - 1)}
                              disabled={processingItems[`${0}-${itemIndex}`] || item.quantity <= 1}
                              className="p-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Minus size={16} />
                            </button>
                            
                            <span className="w-8 text-center">{item.quantity}</span>
                            
                            <button
                              onClick={() => handleQuantityChange(0, itemIndex, item.quantity + 1)}
                              disabled={processingItems[`${0}-${itemIndex}`]}
                              className="p-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveItem(0, itemIndex)}
                            disabled={processingItems[`${0}-${itemIndex}`]}
                            className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
                          >
                            {processingItems[`${0}-${itemIndex}`] ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">₪{item.productId.price * item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <Link
                  href={`/client/${newUser?._id}/supplier-catalog/${typeof carts[0].supplierId === 'object' ? carts[0].supplierId._id : carts[0].supplierId}`}
                  className="px-4 py-2 border border-customBlue text-customBlue rounded-md hover:bg-blue-50 transition flex items-center gap-1"
                >
                  <Plus size={16} />
                  <span>הוסף עוד</span>
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-20">
            <h2 className="text-xl font-bold mb-4">סיכום הזמנה</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>סה&quot;כ פריטים:</span>
                <span>{totalItems}</span>
              </div>
              {carts.length > 0 && (
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>סה&quot;כ לתשלום:</span>
                  <span>₪{calculateCartTotal(carts[0])}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleSubmitOrder}
                disabled={submittingOrder === 'all' || carts.length === 0}
                className="block w-full px-4 py-2 bg-customBlue text-white rounded-md hover:bg-blue-600 transition text-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submittingOrder === 'all' ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>שולח הזמנה...</span>
                  </div>
                ) : (
                  <span>שלח הזמנה</span>
                )}
              </button>
              
              <Link
                href="/orders"
                className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition text-center"
              >
                צפה בהזמנות קודמות
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}     
  