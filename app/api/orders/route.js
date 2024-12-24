// import { NextResponse } from 'next/server';
// import { connectToDB } from '@/utils/database';
// export async function GET(request) {
//   // Add cache control headers
//   const headers = {
//     'Cache-Control': 'no-store, must-revalidate',
//     'Pragma': 'no-cache',
//     'Expires': '0',
//   };

//   try {
//     await connectToDB();
//     const orders = await getOrders();
    
//     return NextResponse.json(orders, { headers });
//   } catch (error) {
//     console.error('Error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers });
//   }
// } 