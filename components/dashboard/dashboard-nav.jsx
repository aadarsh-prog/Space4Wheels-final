"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/firebase/auth-context"
import { Car, Menu, Home, Map, Calendar, User, LogOut, Plus, LayoutGrid } from "lucide-react"

export function DashboardNav({ userRole }) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const userNavItems = [
    { title: "Dashboard", href: "/dashboard", icon: <Home className="h-5 w-5" /> },
    { title: "Find Parking", href: "/dashboard/find", icon: <Map className="h-5 w-5" /> },
    { title: "My Bookings", href: "/dashboard/bookings", icon: <Calendar className="h-5 w-5" /> },
    { title: "Profile", href: "/dashboard/profile", icon: <User className="h-5 w-5" /> },
  ]

  const ownerNavItems = [
    { title: "Dashboard", href: "/dashboard/owner-dashboard", icon: <Home className="h-5 w-5" /> },
    { title: "My Plots", href: "/dashboard/plots", icon: <LayoutGrid className="h-5 w-5" /> },
    { title: "Add Plot", href: "/dashboard/plots/add", icon: <Plus className="h-5 w-5" /> },
    { title: "Profile", href: "/dashboard/profile", icon: <User className="h-5 w-5" /> },
  ]

  const navItems = userRole === "owner" ? ownerNavItems : userNavItems

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex items-center gap-2 pb-4 pt-2">
                <Car className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Space4wheels</span>
              </div>
              <nav className="grid gap-2 py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                      pathname === item.href ? "bg-muted" : "hover:bg-muted"
                    }`}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold hidden md:inline-block">Space4Wheels</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 text-sm font-medium ${
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                {user?.displayName || user?.email}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
