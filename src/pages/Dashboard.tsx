import React from "react"

const shuttles = [
  {
    id: 1,
    route: "Main Gate → Ladies Hostel",
    time: "8:15 AM",
    seats: 3,
    nearest: true,
  },
  {
    id: 2,
    route: "Main Gate → SJT",
    time: "8:25 AM",
    seats: 0,
    nearest: false,
  },
  {
    id: 3,
    route: "Main Gate → PRP",
    time: "8:40 AM",
    seats: 10,
    nearest: false,
  },
  {
    id: 4,
    route: "Main Gate → Men's Hostel",
    time: "9:00 AM",
    seats: 5,
    nearest: false,
  },
]

const getSeatStatus = (seats: number) => {
  if (seats === 0) {
    return <span className="text-red-500 font-semibold">Full</span>
  }
  if (seats <= 3) {
    return (
      <span className="text-orange-500 font-semibold">
        {seats} seats left
      </span>
    )
  }
  return (
    <span className="text-green-600 font-semibold">
      {seats} seats available
    </span>
  )
}

const Dashboard = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Available Shuttles</h2>

      <div className="grid grid-cols-2 gap-6">
        {shuttles.map((shuttle) => (
          <div
            key={shuttle.id}
            className={`p-6 rounded-xl shadow-md transition-all duration-300 ${
              shuttle.nearest
                ? "bg-green-100 border-2 border-green-500"
                : "bg-white"
            }`}
          >
            <h3 className="text-lg font-bold mb-2">{shuttle.route}</h3>

            <p className="mb-2">
              Departure: <span className="font-semibold">{shuttle.time}</span>
            </p>

            <p>
              Seats: {getSeatStatus(shuttle.seats)}
            </p>

            {shuttle.nearest && (
              <div className="mt-3 text-sm text-green-700 font-semibold">
                Nearest Shuttle 🚍
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard