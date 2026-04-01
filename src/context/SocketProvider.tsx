import { useEffect, useMemo, useState, type ReactNode } from "react"
import { io } from "socket.io-client"
import { getSocketOrigin } from "../config/env"
import { SocketContext } from "./socket-context"

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket] = useState(() =>
    io(getSocketOrigin(), {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    })
  )
  const [connected, setConnected] = useState(() => socket.connected)

  useEffect(() => {
    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.disconnect()
    }
  }, [socket])

  const value = useMemo(
    () => ({ socket, connected }),
    [socket, connected]
  )

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  )
}
