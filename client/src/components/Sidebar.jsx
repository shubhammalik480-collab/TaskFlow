import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  HelpCircle,
  Plus,
  CheckSquare,
  X,
} from "lucide-react";

function Sidebar({ isOpen, onClose, onCreateClick }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo */}
      <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-600 p-2">
            <CheckSquare className="h-6 w-6 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-slate-800">
            Task<span className="text-blue-600">Flow</span>
          </h1>
        </div>

        <button
          onClick={onClose}
          className="lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        <nav className="space-y-2">
          <a
            href="#dashboard"
            className="flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-3 font-medium text-blue-600"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </a>

          <a
            href="#boards"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-slate-600 transition hover:bg-slate-100"
          >
            <FolderKanban size={20} />
            My Boards
          </a>
        </nav>

        {/* Create Board */}
        <button
        onClick={onCreateClick}
         className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm font-medium text-slate-600 transition hover:border-blue-500 hover:text-blue-600">
          
          <Plus size={18} />
          
          Create New Board
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="space-y-2 border-t border-slate-100 p-4">
        <a
          href="#settings"
          className="flex items-center gap-3 rounded-lg px-3 py-3 text-slate-600 hover:bg-slate-100"
        >
          <Settings size={20} />
          Settings
        </a>

        <a
          href="#help"
          className="flex items-center gap-3 rounded-lg px-3 py-3 text-slate-600 hover:bg-slate-100"
        >
          <HelpCircle size={20} />
          Help & Support
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;