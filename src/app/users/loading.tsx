
export default function Loading() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-3 bg-white rounded shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}