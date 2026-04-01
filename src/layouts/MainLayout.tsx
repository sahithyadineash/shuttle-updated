import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Navbar />
      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
