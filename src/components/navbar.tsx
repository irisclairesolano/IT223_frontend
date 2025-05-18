export function Navbar() {
  return (
    <nav className="border-b dark:border-zinc-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="font-bold">SnapxZ</div>
        <div className="flex gap-4">
          <a href="/login" className="hover:text-gray-600 dark:hover:text-gray-300">Login</a>
          <a href="/register" className="hover:text-gray-600 dark:hover:text-gray-300">Register</a>
        </div>
      </div>
    </nav>
  );
}