export default function Home() {
  // Dummy data for the dashboard
  const stats = [
    { label: 'Total Sales', value: '$12,345' },
    { label: 'Total Products', value: '567' },
    { label: 'Total Brands', value: '42' },
    { label: 'Total Orders', value: '1,234' },
  ];

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white shadow rounded-lg p-6 flex flex-col justify-between"
          >
            <dt className="text-sm font-medium text-gray-500">
              {stat.label}
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">
              {stat.value}
            </dd>
          </div>
        ))}
      </div>
    </main>
  );
}
