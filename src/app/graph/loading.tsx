export default function Loading() {
  return (
    <div className="page-with-nav">
      <div className="w-full h-[calc(100vh-56px)] animate-pulse bg-gray-900 flex items-center justify-center">
        <div className="text-xs text-gray-700">Loading graph…</div>
      </div>
    </div>
  );
}
