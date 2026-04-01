function PaymentHistory() {
  const payments = [
    {
      id: 1,
      amount: 20,
      destination: "SJT",
      date: "31 Mar 2026",
      time: "08:15 AM",
      status: "Paid",
    },
    {
      id: 2,
      amount: 20,
      destination: "Men's Hostel",
      date: "30 Mar 2026",
      time: "06:45 PM",
      status: "Paid",
    },
    {
      id: 3,
      amount: 20,
      destination: "PRP",
      date: "29 Mar 2026",
      time: "09:10 AM",
      status: "Paid",
    },
    {
      id: 4,
      amount: 20,
      destination: "TT",
      date: "28 Mar 2026",
      time: "01:20 PM",
      status: "Paid",
    },
    {
      id: 5,
      amount: 20,
      destination: "Ladies Hostel",
      date: "27 Mar 2026",
      time: "07:30 PM",
      status: "Paid",
    },
  ]

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "30px",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Payment History</h2>

      <div
        style={{
          display: "grid",
          gap: "15px",
          maxWidth: "700px",
          margin: "auto",
        }}
      >
        {payments.map((payment) => (
          <div
            key={payment.id}
            style={{
              background: "white",
              padding: "18px",
              borderRadius: "12px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>₹{payment.amount}</h3>
              <p style={{ margin: "5px 0", color: "#475569" }}>
                Destination: {payment.destination}
              </p>
              <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
                {payment.date} • {payment.time}
              </p>
            </div>

            <div
              style={{
                color: "green",
                fontWeight: "bold",
                background: "#dcfce7",
                padding: "6px 12px",
                borderRadius: "20px",
              }}
            >
              {payment.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PaymentHistory