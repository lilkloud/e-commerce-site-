export default function ProductGridSkeleton({ count = 9 }: { count?: number }) {
  const items = Array.from({ length: count })
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((_, i) => (
        <div key={i} className="rounded-xl border bg-white p-4 animate-pulse">
          <div className="aspect-square rounded-lg bg-slate-200" />
          <div className="mt-3 h-4 w-2/3 bg-slate-200 rounded" />
          <div className="mt-2 h-4 w-1/3 bg-slate-200 rounded" />
          <div className="mt-4 h-9 w-full bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  )
}
