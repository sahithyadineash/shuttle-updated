/* Fail fast with a clear message if backend dependencies were never installed. */
try {
  require.resolve("express")
} catch {
  console.error(
    "Backend dependencies are missing. From the backend folder run:\n  npm install\n"
  )
  process.exit(1)
}
