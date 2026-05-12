export default function Loading() {
  return (
    <div className="page-with-nav">
      <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-6 bg-gray-800 rounded w-24" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-800 rounded w-32" />
            <div className="h-16 bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
