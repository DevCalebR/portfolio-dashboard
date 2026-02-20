import { NavLink } from 'react-router-dom'

const navItems = [
  { end: true, label: 'Dashboard', to: '/dashboard' },
  { end: true, label: 'Runs', to: '/runs' },
  { end: true, label: 'Create Run', to: '/runs/new' },
]

export function SideNav() {
  return (
    <div className="side-nav">
      <div className="side-nav__brand">
        <span className="side-nav__brand-mark">PD</span>
        <div>
          <p className="side-nav__brand-title">Portfolio Dashboard</p>
          <p className="side-nav__brand-subtitle">Backtest Workspace</p>
        </div>
      </div>
      <nav aria-label="Primary">
        <ul className="side-nav__list">
          {navItems.map((item) => (
            <li className="side-nav__item" key={item.to}>
              <NavLink
                className={({ isActive }) =>
                  `side-nav__link${isActive ? ' is-active' : ''}`
                }
                end={item.end}
                to={item.to}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
