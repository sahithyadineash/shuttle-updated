const Payments = () => {
  const payments = [
    {
      id: "PAY-001",
      route: "Main Gate → Ladies Hostel",
      amount: 20,
      status: "Paid",
      date: "31 Mar 2026",
    },
    {
      id: "PAY-002",
      route: "Main Gate → SJT",
      amount: 15,
      status: "Pending",
      date: "30 Mar 2026",
    },
  ]

  return (
    <div className="p-6 text-black">
      <h2 className="text-2xl font-bold mb-6">Payments</h2>

      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-white shadow rounded-xl p-4"
          >
            <p><b>Ride:</b> {payment.route}</p>
            <p><b>Amount:</b> ₹{payment.amount}</p>
            <p><b>Date:</b> {payment.date}</p>
            <p>
              <b>Status:</b>{" "}
              <span
                className={
                  payment.status === "Paid"
                    ? "text-green-600"
                    : "text-orange-500"
                }
              >
                {payment.status}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Payments