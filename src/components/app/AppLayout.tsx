import { useState } from "react"
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { clearTokens, getUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"

const nav = [
  { path: "/app/dashboard", icon: "LayoutDashboard", label: "Дашборд" },
  { path: "/app/tasks", icon: "ListChecks", label: "Задания" },
  { path: "/app/articles", icon: "FileText", label: "Статьи" },
  { path: "/app/calendar", icon: "CalendarDays", label: "Календарь" },
  { path: "/app/settings", icon: "Settings", label: "Настройки" },
]

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = getUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const logout = () => {
    clearTokens()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-4 border-b border-zinc-800">
          <h1 className="font-orbitron text-lg font-bold text-white">
            Geo<span className="text-red-500">Content</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">{user?.email}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <Icon name={item.icon} size={16} fallback="Circle" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-zinc-800">
          <div className="flex items-center gap-2 mb-2 px-3 py-1">
            <Icon name="UserCircle" size={16} className="text-zinc-500" />
            <span className="text-xs text-zinc-400 capitalize">{user?.role}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-zinc-800">
            <Icon name="LogOut" size={14} className="mr-2" />
            Выйти
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-zinc-900/90 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-zinc-400">
            <Icon name="Menu" size={20} />
          </button>
          <span className="font-orbitron text-sm font-bold text-white">Geo<span className="text-red-500">Content</span></span>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
