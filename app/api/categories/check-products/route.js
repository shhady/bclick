import { connectToDB } from "@/utils/database";
import Product from "@/models/product";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const categoryId = url.searchParams.get("categoryId");

    if (!categoryId) {
      return new Response(
        JSON.stringify({ error: "Category ID is required." }),
        { status: 400 }
      );
    }

    await connectToDB();

    // Count the number of products with the given categoryId
    const productCount = await Product.countDocuments({ categoryId });

    return new Response(
      JSON.stringify({
        hasProducts: productCount > 0,
        productCount,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking products by category:", error);
    return new Response(
      JSON.stringify({ error: "Failed to check products by category." }),
      { status: 500 }
    );
  }
}