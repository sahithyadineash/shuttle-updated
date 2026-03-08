import { Link } from "react-router-dom"

const Sidebar = () => {
  return (
    <div className="w-64 bg-dark text-white min-h-screen p-6">
      <h2 className="text-lg font-bold mb-6">Menu</h2>
      <ul className="space-y-4">
        <li>
          <Link to="/dashboard" className="hover:text-accent">
            Dashboard
          </Link>
        </li>
        <li>
          <a href="#" className="hover:text-accent">
            Book Shuttle
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-accent">
            Track Shuttle
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-accent">
            Settings
          </a>
        </li>
      </ul>
    </div>
  )
}

export default Sidebar