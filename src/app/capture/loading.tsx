export default function Loading() {
  return (
    <div className="page-with-nav">
      <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-5 bg-gray-800 rounded w-32" />
        <div className="h-24 bg-gray-800 rounded" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-800 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
