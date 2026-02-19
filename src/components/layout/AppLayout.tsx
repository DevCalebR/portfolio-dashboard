import { Outlet } from 'react-router-dom'
import { SideNav } from './SideNav'
import { TopNav } from './TopNav'

export function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <SideNav />
      </aside>
      <div className="app-shell__main">
        <TopNav />
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
