import {
  Search,
  Bell,
  Menu,
  ChevronDown,
} from "lucide-react";

function Navbar({ onMenuClick }) {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">

      {/* Mobile Menu + Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={23} />
        </button>

        <div className="relative hidden sm:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={19}
          />

          <input
            type="text"
            placeholder="Search anything..."
            className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 sm:gap-6">

        {/* Notifications */}
        <button
          className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={21} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* Profile */}
        <button className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
            SM
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-slate-800">
              Shubham Malik
            </p>

            <p className="text-xs text-slate-500">
              Workspace Admin
            </p>
          </div>

          <ChevronDown
            size={17}
            className="hidden text-slate-400 sm:block"
          />
        </button>

      </div>
    </header>
  );
}

export default Navbar;