const handleAccept = async () => {
  setErrorMessage('');
  try {
    // First update the order status
    await onUpdateOrderStatus(order._id, 'approved', null);
    
    // Update product stock and reservations
    await updateProductStock(order.items, 'approve');

    // Send email notification
    const emailResponse = await fetch('/api/send-order-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.orderNumber,
        clientEmail: order.client.email,
        status: 'approved'
      })
    });

    if (!emailResponse.ok) {
      console.error('Failed to send email notification');
    }

    toast({
      title: 'הצלחה',
      description: 'ההזמנה אושרה ונשלחה הודעה ללקוח!',
    });
    
    const updatedOrders = globalUser.orders.map((o) =>
      o._id === order._id ? { ...o, status: 'approved' } : o
    );
    updateGlobalUser({ orders: updatedOrders });
    onClose();
  } catch (error) {
    setErrorMessage('שגיאה באישור ההזמנה. אנא נסה שוב.');
  }
};

const handleReject = async () => {
  if (!note) {
    setErrorMessage('יש להוסיף הערה לדחייה.');
    return;
  }
  setErrorMessage('');
  try {
    // First update the order status
    await onUpdateOrderStatus(order._id, 'rejected', note);
    
    // Update product reservations (not stock)
    await updateProductStock(order.items, 'reject');

    // Send email notification
    const emailResponse = await fetch('/api/send-order-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.orderNumber,
        clientEmail: order.client.email,
        status: 'rejected',
        note
      })
    });

    if (!emailResponse.ok) {
      console.error('Failed to send email notification');
    }

    toast({
      title: 'הצלחה',
      description: 'ההזמנה נדחתה ונשלחה הודעה ללקוח!',
    });
    
    const updatedOrders = globalUser.orders.map((o) =>
      o._id === order._id ? { ...o, status: 'rejected' } : o
    );
    updateGlobalUser({ orders: updatedOrders });
    onClose();
  } catch (error) {
    setErrorMessage('שגיאה בדחיית ההזמנה. אנא נסה שוב.');
  }
}; 