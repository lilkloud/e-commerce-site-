export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse">
      <div className="aspect-square bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-24" />
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 bg-slate-200 rounded w-24" />
          <div className="h-9 bg-slate-200 rounded w-24" />
        </div>
      </div>
    </div>
  )
}


