export default function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse">
            <div className="aspect-square bg-slate-200" />
          </div>

          {/* Details */}
          <div className="space-y-4 animate-pulse">
            <div className="h-5 w-24 bg-slate-200 rounded" />
            <div className="h-8 w-2/3 bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-5/6 bg-slate-200 rounded" />

            <div className="mt-6">
              <div className="h-8 w-32 bg-slate-200 rounded" />
              <div className="h-4 w-40 bg-slate-200 rounded mt-2" />
            </div>

            <div className="flex gap-3 mt-4">
              <div className="h-10 w-36 bg-slate-200 rounded" />
              <div className="h-10 w-36 bg-slate-200 rounded" />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="h-6 w-48 bg-slate-200 rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-white p-4 animate-pulse">
                <div className="aspect-square rounded-lg bg-slate-200" />
                <div className="mt-3 h-4 w-2/3 bg-slate-200 rounded" />
                <div className="mt-2 h-4 w-1/3 bg-slate-200 rounded" />
                <div className="mt-4 h-9 w-full bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
