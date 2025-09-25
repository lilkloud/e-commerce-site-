export default function LoadingCheckout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border p-6 animate-pulse space-y-4">
                <div className="h-5 w-40 bg-slate-200 rounded" />
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((__, j) => (
                    <div key={j} className="h-10 bg-slate-200 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6 animate-pulse space-y-4">
              <div className="h-5 w-32 bg-slate-200 rounded" />
              {Array.from({ length: 3 }).map((_, k) => (
                <div key={k} className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded bg-slate-200" />
                  <div className="flex-1">
                    <div className="h-4 w-1/2 bg-slate-200 rounded mb-2" />
                    <div className="h-4 w-1/3 bg-slate-200 rounded" />
                  </div>
                  <div className="h-4 w-12 bg-slate-200 rounded" />
                </div>
              ))}
              <div className="h-10 w-full bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


