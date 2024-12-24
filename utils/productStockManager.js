export async function updateProductStock(items, action) {
  try {
    const response = await fetch('/api/products/update-stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, action })
    });

    if (!response.ok) {
      throw new Error('Failed to update product stock');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
}

export async function validateStockAvailability(items) {
  try {
    const response = await fetch('/api/products/validate-stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });

    if (!response.ok) {
      throw new Error('Failed to validate stock');
    }

    const { valid, errors } = await response.json();
    return { valid, errors };
  } catch (error) {
    console.error('Error validating stock:', error);
    throw error;
  }
} 