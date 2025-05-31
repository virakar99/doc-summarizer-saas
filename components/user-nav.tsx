"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function UserNav() {
  const { isSignedIn, user } = useUser()

  return (
    <div className="flex items-center gap-4">
      {isSignedIn ? (
        <>
          <span className="text-sm text-gray-700">{user.firstName || user.emailAddresses[0].emailAddress}</span>
          <UserButton afterSignOutUrl="/" />
        </>
      ) : (
        <>
          <Link href="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Sign Up</Button>
          </Link>
        </>
      )}
    </div>
  )
}
