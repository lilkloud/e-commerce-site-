export default function LoadingOrderDetail() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-64 bg-slate-200 rounded" />
            <div className="h-6 w-24 bg-slate-200 rounded" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg bg-slate-200" />
                <div className="flex-1">
                  <div className="h-4 w-1/2 bg-slate-200 rounded mb-2" />
                  <div className="h-4 w-1/3 bg-slate-200 rounded" />
                </div>
                <div className="h-4 w-16 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


