import { connectToDB } from '@/utils/database';
import Product from '@/models/product';

export async function POST(req) {
  try {
    await connectToDB();
    const { items } = await req.json();

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock  < item.quantity) {
        return new Response(
          JSON.stringify({
            message: `מלאי לא מספיק עבור המוצר: ${product?.name || 'לא נמצא'}`,
          }),
          { status: 400 }
        );
      }
    }

    return new Response(
      JSON.stringify({ message: 'מלאי מאומת בהצלחה' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Stock validation failed:', error);
    return new Response(
      JSON.stringify({ message: 'שגיאה בעת אימות המלאי' }),
      { status: 500 }
    );
  }
}
