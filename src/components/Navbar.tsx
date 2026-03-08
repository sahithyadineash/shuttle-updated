import { FaUserCircle } from "react-icons/fa"
import { useEffect, useState } from "react"

const Navbar = () => {
  const [studentName, setStudentName] = useState("")

  useEffect(() => {
    const name = localStorage.getItem("studentName")
    if (name) {
      setStudentName(name)
    }
  }, [])

  return (
    <div className="h-16 bg-primary text-white flex items-center justify-between px-6 shadow-md">
      
      <h1 className="text-xl font-bold">Campus Shuttle</h1>

      <div className="flex flex-col items-center justify-center">
        <FaUserCircle size={30} className="text-white" />
        <span className="text-sm font-medium mt-1">
          {studentName}
        </span>
      </div>
    </div>
  )
}

export default Navbar