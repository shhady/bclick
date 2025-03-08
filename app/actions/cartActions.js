'use server';

import { connectToDB } from '@/utils/database';
import Cart from '@/models/cart';
import Product from '@/models/product';

export async function addToCart({ clientId, supplierId, productId, quantity }) {
  await connectToDB();

  try {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');
    if (product.supplierId.toString() !== supplierId) throw new Error('Invalid supplier for product');

    const availableStock = product.stock;
    if (availableStock < quantity) throw new Error('Insufficient available stock');

    let cart = await Cart.findOne({ clientId, supplierId })

    if (cart) {
      const existingItem = cart.items.find((item) => item.productId._id.toString() === productId);

      if (existingItem) {
        existingItem.quantity = quantity;
      } else {
        cart.items.push({
          productId: productId, // Save the productId, but populate later
          quantity,
        });
      }
      cart.updatedAt = new Date();
      await cart.save();
    } else {
      cart = new Cart({
        clientId,
        supplierId,
        items: [{
          productId: productId, // Save the productId, but populate later
          quantity,
        }],
      });
      await cart.save();
    }

    // Fetch the updated cart with populated fields
    const populatedCart = await Cart.findOne({ clientId, supplierId })
      .populate('items.productId', 'name price stock  barCode imageUrl weight weightUnit')
      const serializedCart = JSON.parse(JSON.stringify(populatedCart));

    return {
      success: true,
      cart:serializedCart, // Return fully populated cart
      updatedAvailableStock: availableStock,
     
    };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, message: error.message };
  }
}

  
export async function updateCartItem({ clientId, supplierId, productId, quantity }) {
    await connectToDB();
  
    try {
      if (quantity < 1) throw new Error('Quantity must be at least 1');
  
      const product = await Product.findById(productId);
      if (!product) throw new Error('Product not found');
      if (product.supplierId.toString() !== supplierId) throw new Error('Invalid supplier for product');
      if (product.stock < quantity) throw new Error('Insufficient stock');
  
      const cart = await Cart.findOneAndUpdate(
        { clientId, supplierId, 'items.productId': productId },
        { $set: { 'items.$.quantity': quantity, updatedAt: new Date() } },
        { new: true }
      );
  
      return { success: true, cart };
    } catch (error) {
      console.error('Error updating cart item:', error);
      return { success: false, message: error.message };
    }
  }
  

  export async function getCart({ clientId, supplierId }) {
    await connectToDB();
  
    try {
      const cart = await Cart.findOne({ clientId, supplierId })
        .populate('items.productId', 'name price stock barCode imageUrl weight weightUnit')
        .lean(); // Converts the result to plain objects
  
      if (cart) {
        const serializedCart = JSON.stringify(cart)
        return { success: true, serializedCart }; // Plain object returned
      } else {
        return { success: false, message: 'Cart not found' };
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      return { success: false, message: error.message };
    }
  }

  export async function deleteCart({ clientId, supplierId }) {
    await connectToDB();
  
    try {
      await Cart.findOneAndDelete({ clientId, supplierId });
      return { success: true };
    } catch (error) {
      console.error('Error deleting cart:', error);
      return { success: false, message: error.message };
    }
  }
  