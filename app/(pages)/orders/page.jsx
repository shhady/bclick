import { getOrders } from '@/utils/getOrders';
import Orders from './Orders';

export default async function OrdersPage() {
  const orders = await getOrders();
  
  return (
    <div className="container mx-auto px-4">
      <Orders orders={orders} />
    </div>
  );
}
