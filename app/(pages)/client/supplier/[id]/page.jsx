
export default async function Page({ params }) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const response = await fetch(`http://localhost:3000/api/clients/get-supplier/6741e1c62e92755eb97e2e36`, {
    next: { revalidate: 10 }, // Optional caching for server components
  });

  if (!response.ok) {
    console.error('Error fetching user:', response.statusText);
    return <div>Failed to fetch user data.</div>;
  }

  const user = await response.json();
  return (
    <div>
      <h1>User Details</h1>
      <p>{user.name}</p>
      <p>{user.email}</p>
    </div>
  );
}
