'use server';

export async function fetchOrders(page, limit) {
    const perPage = 20;
    const apiUrl =  `/api/orders?page=${page + 1}&limit=15&userId=${globalUser._id}&role=${globalUser.role}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}
