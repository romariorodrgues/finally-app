"use client"

import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: '/auth/login'
    })
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleSignOut}
      className="text-gray-600 hover:text-[#D02E32]"
    >
      Sair
    </Button>
  )
} 