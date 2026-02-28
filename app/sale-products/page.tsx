export default function SaleProductsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-24 w-24 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4v2m0 6v2M7 5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H7z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Under Construction</h1>
        <p className="text-xl text-gray-600 mb-2">Sale Products</p>
        <p className="text-gray-500">This page is currently being built. Please check back soon!</p>
      </div>
    </div>
  );
}