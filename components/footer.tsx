export default function Footer() {
  return (
    <footer className="border-t bg-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="font-semibold text-slate-900">Private</div>
          <p className="text-slate-600 mt-2">Your modern storefront. Discover products you’ll love.</p>
        </div>
        <div>
          <div className="font-medium text-slate-900 mb-2">Shop</div>
          <ul className="space-y-1 text-slate-600">
            <li><a href="/" className="hover:text-slate-900">Home</a></li>
            <li><a href="/orders" className="hover:text-slate-900">Orders</a></li>
            <li><a href="/admin/orders" className="hover:text-slate-900">Admin</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium text-slate-900 mb-2">Support</div>
          <ul className="space-y-1 text-slate-600">
            <li><a href="#" className="hover:text-slate-900">Contact</a></li>
            <li><a href="#" className="hover:text-slate-900">Privacy</a></li>
            <li><a href="#" className="hover:text-slate-900">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-xs text-slate-500 text-center">© {new Date().getFullYear()} Private. website by cyberkloud NEXUS.</div>
    </footer>
  )
}
