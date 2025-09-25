export default function LoadingOrders() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-8 w-40 bg-slate-200 rounded mb-6 animate-pulse" />
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-48 bg-slate-200 rounded" />
                <div className="h-6 w-24 bg-slate-200 rounded" />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {Array.from({ length: 3 }).map((__, j) => (
                    <div key={j} className="w-12 h-12 rounded-lg bg-slate-200 border-2 border-white" />
                  ))}
                </div>
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
                  <div className="h-4 w-1/2 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


