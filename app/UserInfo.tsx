"use client"

import { useSession, SessionProvider } from "next-auth/react"

export function UserInfo() {
  const { data: session } = useSession()
  return <div>
    <p>UserInfo</p>
    <p>{session?.user?.name}</p>
    <p>{session?.user?.email}</p>
    <p>{session?.user?.image}</p>
  </div>
}

export function UserInfoProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}