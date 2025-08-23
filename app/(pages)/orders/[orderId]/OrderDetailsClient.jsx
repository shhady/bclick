// app/(pages)/orders/[orderId]/OrderDetailsClient.jsx
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
// import { useUserContext } from '@/app/context/UserContext';
import { useNewUserContext } from '@/app/context/NewUserContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, ShoppingCart, Loader2 } from 'lucide-react';
import { FiPrinter, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { OrderUpdateDialog } from '@/components/OrderUpdateDialog';
import { useCartContext } from '@/app/context/CartContext';
import { addToCart } from '@/app/actions/cartActions';
import ConfirmationModal from '@/app/components/ConfirmationModal';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const statusText = {
  pending: 'ממתין',
  processing: 'בטיפול',
  approved: 'הושלם',
  rejected: 'בוטל'
};

const OrderTable = ({ items }) => (
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-2 sm:px-4 lg:px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          מוצר
        </th>
        <th className="hidden md:table-cell px-2 sm:px-4 lg:px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          ברקוד
        </th>
        <th className="px-2 sm:px-4 lg:px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          כמות
        </th>
        <th className="px-2 sm:px-4 lg:px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          מחיר
        </th>
        <th className="px-2 sm:px-4 lg:px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          סה״כ
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {items.map((item) => (
        <tr key={item._id}>
          <td className="px-2 sm:px-4 lg:px-6 py-2 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">
              {item.productId?.name}
            </div>
          </td>
          <td className="hidden md:table-cell px-2 sm:px-4 lg:px-6 py-2 text-center whitespace-nowrap">
            <div className="text-sm text-gray-900">{item.productId?.barCode || 'N/A'}</div>
          </td>
          <td className="px-2 sm:px-4 lg:px-6 py-2 text-center whitespace-nowrap">
            <div className="text-sm text-gray-900">{item.quantity}</div>
          </td>
          <td className="px-2 sm:px-4 lg:px-6 py-2 text-center whitespace-nowrap">
            <div className="text-sm text-gray-900">₪{item.price}</div>
          </td>
          <td className="px-2 sm:px-4 lg:px-6 py-2 text-left whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">
              ₪{(item.quantity * item.price).toFixed(2)}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const PrintContent = ({ order }) => (
  <div className="p-8 max-w-4xl mx-auto" style={{ direction: 'rtl' }}>
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold">פרטי הזמנה #{order.orderNumber}</h1>
      <p className="text-gray-600">
        {new Date(order.createdAt).toLocaleDateString('he-IL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>

    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">פרטי לקוח</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p><strong>שם העסק:</strong> {order.clientId?.businessName}</p>
          <div><strong>טלפון:</strong> <span dir="ltr" className='text-black text-right'>{order.clientId?.phone}</span></div>
          <p><strong>אימייל:</strong> {order.clientId?.email}</p>
        </div>
        <div>
          <p><strong>כתובת:</strong> {order.clientId?.address}</p>
          <p><strong>עיר:</strong> {order.clientId?.city}</p>
        </div>
      </div>
    </div>

    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">פרטי הזמנה</h2>
      <OrderTable items={order.items} />
    </div>

    <div className="text-left">
      <h2 className="text-xl font-bold mb-2">סיכום</h2>
      <div className="space-y-1">
        <p className="text-lg font-bold">סך הכל ללא מע&quot;מ: ₪{order.total.toFixed(2)}</p>
        <p className="text-lg font-bold">מע&quot;מ: {order.tax * 100}% (₪{(order.total * order.tax).toFixed(2)})</p>
        <p className="text-2xl font-bold">סה״כ לתשלום: ₪{order.totalAfterTax.toFixed(2)}</p>
      </div>
      
    </div>
  </div>
);

export default function OrderDetailsClient({ initialOrder }) {
  const [order, setOrder] = useState(initialOrder);
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [stockInfo, setStockInfo] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const { newUser,updateNewUser } = useNewUserContext();
  const router = useRouter();
  const { toast } = useToast();
  const printRef = useRef(null);
  const [reordering, setReordering] = useState(false);
  const { setCart, fetchCartAgain, addItemToCart, clearCart } = useCartContext();  
  const [showStockModal, setShowStockModal] = useState(false);
  const [modalData, setModalData] = useState({
    title: '',
    description: '',
    confirmAction: null,
    confirmText: '',
    confirmVariant: 'primary'
  });
 
  // Permission checks
  const isSupplier = newUser?.role === 'supplier' && order.supplierId._id === newUser._id;
  const isClient = newUser?.role === 'client' && order.clientId._id === newUser._id;
  const canModifyOrder = isClient && order.status === 'pending';

  const handleUpdateOrderStatus = async (status) => {
    if (status === 'rejected' && !note.trim()) {
      setErrorMessage('חובה להוסיף הערה בעת דחיית הזמנה');
      return;
    }

    setLoadingAction(status);
    try {
      // Store the original status for comparison
      const originalStatus = order.status;
      
      const response = await fetch('/api/orders/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id,
          status,
          note: note.trim() || `סטטוס הזמנה עודכן ל${statusText[status]}`,
            userId: newUser._id,
          userRole: newUser.role
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update order');
      }

      const { order: updatedOrder } = await response.json();
      setOrder(updatedOrder);
      setNote('');
      setErrorMessage('');
      
      // Update the newUserContext if available and if this is a supplier changing a pending order
      if (updateNewUser && isSupplier && originalStatus === 'pending' && status !== 'pending') {
        try {
          
          // If we have the newUser object with orders array
          if (newUser && newUser.orders && Array.isArray(newUser.orders)) {
            // Create a new orders array with the updated order
            const updatedOrders = newUser.orders.map(order => 
              order._id === updatedOrder._id 
                ? { ...order, status: status }
                : order
            );
            
            // Update the newUserContext with the new orders array
            updateNewUser({ orders: updatedOrders });
          }
        } catch (error) {
          console.error('Error updating newUserContext:', error);
          // Continue even if updating newUserContext fails
        }
      }
      
      toast({
        title: 'הצלחה',
        description: `ההזמנה ${status === 'approved' ? 'אושרה' : 'נדחתה'} בהצלחה`,
      });
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה בעדכון ההזמנה',
        variant: 'destructive',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteOrder = async () => {
    if (!canModifyOrder) return;

    setLoadingAction('deleting');
    try {
      const response = await fetch('/api/orders/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: order._id,
          userRole: newUser.role 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete order');
      }

      toast({
        title: 'נמחק',
        description: 'ההזמנה נמחקה בהצלחה!',
      });
      router.push('/orders');
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה במחיקת ההזמנה',
        variant: 'destructive',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    const printContent = printRef.current;
    
    if (printWindow && printContent) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>הדפסת הזמנה ${order.orderNumber}</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              @media print {
                body { padding: 20px; }
                @page { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Print after styles are loaded
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handleCheckStock = async () => {
    try {
      const response = await fetch(`/api/orders/stock-check/${order._id}`);
      if (!response.ok) throw new Error('Failed to fetch stock info');
      const data = await response.json();
      setStockInfo(data);
      setShowUpdateDialog(true);
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'שגיאה בטעינת נתוני המלאי',
        variant: 'destructive',
      });
    }
  };

  
  const handleUpdateConfirm = async (updatedItems) => {
    setLoadingAction('updating');
    try {
      const response = await fetch('/api/orders/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id,
          items: updatedItems,
          note: 'עודכנו כמויות בהזמנה',
          userId: newUser._id,
          userRole: newUser.role
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update order');
      }

      const { order: updatedOrder } = await response.json();
      setOrder(updatedOrder);
      setShowUpdateDialog(false);
      
      toast({
        title: 'הצלחה',
        description: 'ההזמנה עודכנה בהצלחה',
      });
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה בעדכון ההזמנה',
        variant: 'destructive',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReorder = async () => {
    if (!isClient) return;
    
    setReordering(true);
    try {
      // Get the supplier ID in the correct format
      const supplierId = typeof order.supplierId === 'object' ? order.supplierId._id : order.supplierId;
      
      // Prepare items for stock validation
      const itemsForValidation = order.items.map(item => ({
        productId: {
          _id: typeof item.productId === 'object' ? item.productId._id : item.productId
        },
        quantity: item.quantity
      }));
      
      // Validate stock for all products at once
      const validateResponse = await fetch('/api/products/validate-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsForValidation })
      });
      
      if (!validateResponse.ok) {
        throw new Error('Failed to validate stock');
      }
      
      const stockData = await validateResponse.json();
      
      // Check if all products have enough stock
      if (!stockData.hasEnoughStock) {
        // Create lists of products with and without stock
        const productsWithStock = [];
        const productsWithoutStock = [];
        
        for (const item of order.items) {
          const productId = typeof item.productId === 'object' ? item.productId._id : item.productId;
          const productName = typeof item.productId === 'object' ? item.productId.name : 'מוצר';
          
          const stockInfo = stockData.stockInfo[productId];
          
          if (stockInfo && stockInfo.hasEnough) {
            productsWithStock.push({
              id: productId,
              name: productName,
              quantity: item.quantity
            });
          } else {
            productsWithoutStock.push({
              id: productId,
              name: productName,
              quantity: item.quantity,
              availableStock: stockInfo ? stockInfo.available : 0
            });
          }
        }
        
        // If no products have stock, show message and return
        if (productsWithStock.length === 0) {
          toast({
            title: 'לא ניתן ליצור הזמנה חוזרת',
            description: 'כל המוצרים בהזמנה זו אינם זמינים במלאי כעת',
            variant: 'destructive',
          });
          
          // Show modal instead of window.confirm
          setModalData({
            title: 'אין מלאי זמין',
            description: 'כל המוצרים בהזמנה זו אינם זמינים במלאי. האם ברצונך לעבור לקטלוג הספק?',
            confirmAction: () => router.push(`/catalog/${supplierId}`),
            confirmText: 'עבור לקטלוג',
            confirmVariant: 'primary'
          });
          setShowStockModal(true);
          
          setReordering(false);
          return;
        }
        
        // If some products have stock and some don't, show a confirmation dialog
        if (productsWithoutStock.length > 0) {
          // Format the out-of-stock products as a numbered list
          const outOfStockList = productsWithoutStock.map((item, index) => 
            `${index + 1}. ${item.name}`
          ).join('\n');
          
          // Show modal instead of window.confirm
          setModalData({
            title: 'חלק מהמוצרים אינם זמינים',
            description: `המוצרים הבאים אינם זמינים במלאי:\n\n${outOfStockList}\n\nהאם ברצונך להמשיך עם המוצרים הזמינים?`,
            confirmAction: async () => {
              // Continue with the reorder process for available products
              await clearCart(newUser._id, supplierId);
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Add only the products that have stock
              let lastCartResponse = null;
              const successfulItems = [];
              
              for (const item of productsWithStock) {
                console.log(`Adding product ${item.id} with quantity ${item.quantity}`);
                
                // Use the addToCart server action
                const response = await addToCart({
                  clientId: newUser._id,
                  supplierId: supplierId,
                  productId: item.id,
                  quantity: item.quantity
                });
                
                if (response.success) {
                  lastCartResponse = response;
                  console.log(`Successfully added product ${item.id}`);
                  successfulItems.push(item);
                } else {
                  console.error(`Failed to add product ${item.id}: ${response.message}`);
                }
                
                // Add a delay between adding items
                await new Promise(resolve => setTimeout(resolve, 300));
              }
              
              // If we have a successful response, update the cart context
              if (lastCartResponse && lastCartResponse.success && lastCartResponse.cart) {
                console.log("Setting cart with:", lastCartResponse.cart);
                setCart(lastCartResponse.cart);
              }
              
              // Add a delay before fetching the cart again
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Update the cart context to ensure UI updates immediately
              await fetchCartAgain();
              
              // Show appropriate message based on results
              toast({
                title: 'הזמנה חוזרת נוצרה חלקית',
                description: `נוספו ${successfulItems.length} מוצרים לעגלה. ${productsWithoutStock.length} מוצרים אינם זמינים במלאי.`,
                variant: 'warning',
              });
              
              // Show which items were out of stock
              const outOfStockNames = productsWithoutStock.map(item => item.name).join(', ');
              toast({
                title: 'מוצרים שאינם זמינים במלאי:',
                description: outOfStockNames,
                variant: 'warning',
              });
              
              // Add a final delay before redirecting
              await new Promise(resolve => setTimeout(resolve, 300));
              
              // Redirect to cart page
              router.push(`/cart/${supplierId}`);
            },
            confirmText: 'המשך עם המוצרים הזמינים',
            confirmVariant: 'warning'
          });
          setShowStockModal(true);
          
          setReordering(false);
          return;
        }
        
      } else {
        // All products have enough stock, proceed with reorder
        
        // Clear any existing cart for this supplier
        await clearCart(newUser._id, supplierId);
        
        // Add a delay to ensure the cart is cleared
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Add all items to cart
        let lastCartResponse = null;
        
        for (const item of order.items) {
          const productId = typeof item.productId === 'object' ? item.productId._id : item.productId;
          
          // Use the addToCart server action
          const response = await addToCart({
            clientId: newUser._id,
            supplierId: supplierId,
            productId: productId,
            quantity: item.quantity
          });
          
          if (response.success) {
            lastCartResponse = response;
          }
          
          // Add a delay between adding items
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // If we have a successful response, update the cart context
        if (lastCartResponse && lastCartResponse.success && lastCartResponse.cart) {
          setCart(lastCartResponse.cart);
        }
        
        // Add a delay before fetching the cart again
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update the cart context to ensure UI updates immediately
        await fetchCartAgain();
        
        // Show success message
        toast({
          title: 'הזמנה חוזרת נוצרה בהצלחה',
          description: 'כל המוצרים נוספו לעגלת הקניות',
        });
      }
      
      // Add a final delay before redirecting
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Redirect to cart page
      router.push(`/cart/${supplierId}`);
      
    } catch (error) {
      console.error('Error creating reorder:', error);
      toast({
        title: 'שגיאה ביצירת הזמנה חוזרת',
        description: error.message || 'אירעה שגיאה בלתי צפויה',
        variant: 'destructive',
      });
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="p-4" dir="rtl">
      {/* Back Button */}
      <button 
        className="hidden  border border-gray-300 rounded-md p-2 my-2 md:flex items-center gap-2 shadow-md hover:bg-gray-50" 
        onClick={() => router.back()}
      >

        <ArrowRight/> חזור לרשימת ההזמנות
      </button>

      {/* Header with Print and Status */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">הזמנה מספר #{order.orderNumber}</h1>
            <p className="text-gray-500">
              {new Date(order.createdAt).toLocaleString('he-IL')}
            </p>
          </div>
          <div className="flex flex-col items-end gap-4">
            {/* Add Reorder button here, only for clients and when status is approved or rejected */}
            {isClient && (order.status === 'approved' || order.status === 'rejected') && (
              <button
                onClick={handleReorder}
                disabled={reordering}
                className="flex items-center justify-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded hover:bg-blue-200 disabled:opacity-50 w-full"
              >
                {reordering ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
                <span>הזמן שוב</span>
              </button>
            )}
            
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status]}`}>
                {statusText[order.status]}
              </span>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <FiPrinter className="w-4 h-4" />
                הדפס
              </button>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              order.status !== 'rejected' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <FiClock className="w-5 h-5" />
            </div>
            <p className="mt-2 text-sm">ממתין</p>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              order.status === 'processing' || order.status === 'approved' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              <FiClock className="w-5 h-5" />
            </div>
            <p className="mt-2 text-sm">בטיפול</p>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              order.status === 'approved' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              <FiCheck className="w-5 h-5" />
            </div>
            <p className="mt-2 text-sm">הושלם</p>
          </div>
        </div>
      </div>

      {/* Customer/Supplier Info Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {isClient ? 'פרטי ספק' : 'פרטי לקוח'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isClient ? (
            // Show Supplier Details for Clients
            <>
              <div>
                <p className="text-gray-600">שם הספק</p>
                <p className="font-medium">{order.supplierId?.businessName}</p>
              </div>
              <div>
                <p className="text-gray-600">טלפון</p>
                <a 
                  href={`tel:${order.supplierId?.phone}`}
                  className="font-medium text-right text-black"
                  dir="ltr"
                >
                  {order.supplierId?.phone}
                </a>
              </div>
              <div>
                <p className="text-gray-600">כתובת</p>
                <p className="font-medium">{order.supplierId?.address}</p>
              </div>
              <div>
                <p className="text-gray-600">אימייל</p>
                <a 
                  href={`mailto:${order.supplierId?.email}`}
                  className="font-medium text-gray-600 hover:text-gray-800"
                >
                  {order.supplierId?.email}
                </a>
              </div>
            </>
          ) : (
            // Show Customer Details for Suppliers
            <>
              <div>
                <p className="text-gray-600">שם העסק</p>
                <p className="font-medium">{order.clientId?.businessName}</p>
              </div>
              <div>
                <p className="text-gray-600">טלפון</p>
                <a 
                  href={`tel:${order.clientId?.phone}`}
                  className="font-medium text-right text-black"
                  dir="ltr"
                >
                  {order.clientId?.phone}
                </a>
              </div>
              <div>
                <p className="text-gray-600">כתובת</p>
                <p className="font-medium">{order.clientId?.address}</p>
              </div>
              <div>
                <p className="text-gray-600">אימייל</p>
                <a 
                  href={`mailto:${order.clientId?.email}`}
                  className="font-medium text-gray-600 hover:text-gray-800"
                >
                  {order.clientId?.email}
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">מוצרים</h2>
        <OrderTable items={order.items} />
        <div className="mt-6 text-left">
          <p className="text-lg font-bold">סך הכל ללא מע&quot;מ: ₪{order.total.toFixed(2)}</p>
          <p className="text-lg font-bold">מע&quot;מ: {order.tax * 100}%</p>
          <p className="text-lg font-bold">סך הכל עם מע&quot;מ: ₪{order.totalAfterTax.toFixed(2)}</p>
        </div>
      </div>

      {/* Status Update Buttons */}
      {order.status !== 'approved' && order.status !== 'rejected' && (
        <div className="bg-white rounded-lg shadow-md mb-16 p-6">
          <h2 className="text-lg font-semibold mb-4">עדכון סטטוס</h2>
          <div className="flex gap-2">
            {isSupplier && order.status === 'pending' && (
              <>
                <button
                  onClick={() => handleUpdateOrderStatus('processing')}
                  disabled={loadingAction === 'processing'}
                  className="flex-1 bg-blue-100 text-blue-600 px-4 py-2 rounded hover:bg-blue-200 disabled:opacity-50"
                >
                  התחל טיפול
                </button>
                <button
                  onClick={() => handleUpdateOrderStatus('rejected')}
                  disabled={loadingAction === 'rejected'}
                  className="flex-1 bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 disabled:opacity-50"
                >
                  דחה הזמנה
                </button>
              </>
            )}
            {isSupplier && order.status === 'processing' && (
              <>
                <button
                  onClick={() => handleUpdateOrderStatus('approved')}
                  disabled={loadingAction === 'approved'}
                  className="flex-1 bg-green-100 text-green-600 px-4 py-2 rounded hover:bg-green-200 disabled:opacity-50"
                >
                  אשר הזמנה
                </button>
                <button
                  onClick={() => handleUpdateOrderStatus('rejected')}
                  disabled={loadingAction === 'rejected'}
                  className="flex-1 bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 disabled:opacity-50"
                >
                  דחה הזמנה
                </button>
              </>
            )}
            {canModifyOrder && (
              <>
                <button
                  onClick={handleCheckStock}
                  disabled={loadingAction === 'updating'}
                  className="flex-1 bg-blue-100 text-blue-600 px-4 py-2 rounded hover:bg-blue-200 disabled:opacity-50"
                >
                  עדכן הזמנה
                </button>
                <button
                  onClick={handleDeleteOrder}
                  disabled={loadingAction === 'deleting'}
                  className="flex-1 bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 disabled:opacity-50"
                >
                  מחק הזמנה
                </button>
              </>
            )}
          </div>
          {isSupplier && (order.status === 'pending' || order.status === 'processing') && (
            <div className="mt-4">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="הוסף הערה (חובה לדחייה)"
                className="w-full p-2 border rounded"
              />
              {errorMessage && (
                <p className="text-red-500 mt-2">{errorMessage}</p>
              )}
            </div>
          )}
        </div>
      )}
{(order.status === 'approved' || order.status === 'rejected' || order.status === 'processing') && (
        <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${
          order.status === 'approved' ? 'text-green-600' : 
          order.status === 'processing' ? 'text-blue-600' :
          'text-red-600'
        }`}>
          <h2 className="text-lg font-semibold">
            {order.status === 'approved' ? 'ההזמנה הושלמה' : 
             order.status === 'processing' ? 'ההזמנה בטיפול' :
             'ההזמנה בוטלה'}
          </h2>
        </div>
      )}
      {/* Notes History */}
      {order.notes && order.notes.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">היסטוריית הערות</h2>
          <div className="space-y-3">
            {order.notes.map((note, index) => (
              <div key={index} className="border-r-2 border-gray-200 pr-4">
                <div className="text-sm text-gray-600">
                  {new Date(note.date).toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="text-gray-800 mt-1">{note.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print Content */}
      <div className="hidden">
        <div ref={printRef}>
          <PrintContent order={order} />
        </div>
      </div>

      {/* Update Dialog */}
      <OrderUpdateDialog
        isOpen={showUpdateDialog}
        onClose={() => setShowUpdateDialog(false)}
        onConfirm={handleUpdateConfirm}
        order={order}
        stockInfo={stockInfo}
        loadingAction={loadingAction}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        onConfirm={() => {
          setShowStockModal(false);
          if (modalData.confirmAction) {
            modalData.confirmAction();
          }
        }}
        title={modalData.title}
        description={modalData.description}
        confirmText={modalData.confirmText}
        confirmVariant={modalData.confirmVariant}
      />
    </div>
  );
}