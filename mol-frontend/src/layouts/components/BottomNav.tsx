import { NavLink } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { MaterialIcon } from '@/shared/ui/MaterialIcon'

const navItems = [
  { to: '/dashboard', label: 'Arena', icon: 'sports_cricket', enabled: true },
  { to: '#squad', label: 'Squad', icon: 'groups', enabled: false },
  { to: '/history', label: 'History', icon: 'history', enabled: true },
  { to: '/profile', label: 'Profile', icon: 'person', enabled: true },
] as const

export function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 rounded-t-xl border-t border-primary-container/20 bg-surface-container/60 shadow-[0_-4px_20px_rgba(0,218,243,0.15)] backdrop-blur-2xl md:hidden"
    >
      <div className="mx-auto flex h-20 max-w-5xl items-center justify-around px-gutter">
        {navItems.map(({ to, label, icon, enabled }) =>
          enabled ? (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center rounded-xl px-4 py-1 transition-all duration-100 active:scale-95',
                  isActive
                    ? 'bg-primary/10 text-primary-container shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                    : 'text-outline opacity-70 hover:text-primary-fixed',
                )
              }
            >
              <MaterialIcon name={icon} className="mb-1 text-2xl fill" />
              <span className="font-mono text-xs font-medium tracking-widest uppercase">
                {label}
              </span>
            </NavLink>
          ) : (
            <button
              key={to}
              type="button"
              disabled
              className="flex cursor-not-allowed flex-col items-center justify-center text-outline opacity-40"
              aria-label={`${label} — coming soon`}
            >
              <MaterialIcon name={icon} className="mb-1 text-2xl fill" />
              <span className="font-mono text-xs font-medium tracking-widest uppercase">
                {label}
              </span>
            </button>
          ),
        )}
      </div>
    </nav>
  )
}
