import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar'
import MobileNavbar from '../MobileNavbar'

const AppLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
      <MobileNavbar />
    </div>
  )
}

export default AppLayout
