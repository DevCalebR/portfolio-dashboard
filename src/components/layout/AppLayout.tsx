import { Outlet } from 'react-router-dom'
import { SideNav } from './SideNav'
import { TopNav } from './TopNav'

export function AppLayout() {
  return (
    <>
      <a className="skip-link" href="#app-main-content">
        Skip to main content
      </a>
      <div className="app-shell">
        <aside className="app-shell__sidebar">
          <SideNav />
        </aside>
        <div className="app-shell__main">
          <TopNav />
          <main className="app-shell__content" id="app-main-content" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}
