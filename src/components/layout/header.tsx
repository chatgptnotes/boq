'use client'

import { signOut } from '@/services/auth'
import { Button } from '@/components/ui/button'
import { LogOut, Menu } from 'lucide-react'

interface HeaderProps {
  userEmail: string
  onMenuToggle?: () => void
}

export function Header({ userEmail, onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b border-gray-200 bg-white px-4 sm:px-6">
      <button
        onClick={onMenuToggle}
        className="mr-3 rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 lg:hidden">BOQ Platform</h1>
        <div className="hidden lg:block" />

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-gray-600 sm:block">{userEmail}</span>
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="mr-1.5 h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
