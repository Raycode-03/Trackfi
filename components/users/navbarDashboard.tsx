"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Clipboard, UtensilsCrossed, MenuSquare, X } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { OrderWithItems, CartItem } from "@/types"
import { cartApi, orderApi } from "@/lib/api"

interface NavbarProps {
  tableNumber: number
}

export default function NavbarDashboard({ tableNumber }: NavbarProps) {

  const { data: cartItems } = useQuery<CartItem[]>({
    queryKey: ["cart", tableNumber],
    queryFn: () => cartApi.getCart(),
    staleTime: 0,
  })

  const cartCount = cartItems?.length ?? 0

  const { data: orders } = useQuery<OrderWithItems[]>({
    queryKey: ["orders", tableNumber],
    queryFn: () => orderApi.getOrders(),
    staleTime: 0,
  })

  const orderCount = orders?.length ?? 0

  // mobile menu
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node

      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <nav className="sticky top-0 z-30 h-16 bg-[#16A34A] border-b shadow-sm">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-16">

          {/*  LOGO */}

          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logos/savory_icon.png"
              alt="Restaurant Logo"
              width={80}
              height={80}
              priority
              className="rounded-lg"
            />
          </Link>

          {/*  DESKTOP NAV */}

          <div className="hidden sm:flex items-center gap-4">

            <Link
              href={`/menu/${tableNumber}`}
              className="flex items-center gap-1 px-2 py-2 rounded-md text-white/90 hover:text-white hover:bg-white/10 transition"
            >
              <UtensilsCrossed className="h-5 w-5" />
              <span className="text-xs">Menu</span>
            </Link>

            <Link
              href={`/orders/${tableNumber}`}
              className="relative flex items-center gap-1 px-2 py-2 rounded-md text-white/90 hover:text-white hover:bg-white/10 transition"
            >
              <Clipboard className="h-5 w-5" />
              <span className="text-xs">Orders</span>

              {orderCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {orderCount}
                </span>
              )}
            </Link>

            <Link
              href={`/cart/${tableNumber}`}
              className="relative flex items-center gap-1 px-2 py-2 rounded-md text-white/90 hover:text-white hover:bg-white/10 transition"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs">Cart</span>

              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Table Info */}

            <div className="ml-3 pl-3 border-l border-white/30">
              <p className="text-[10px] uppercase tracking-wide text-white/80">
                Ordering at
              </p>
              <p className="text-sm font-semibold text-white">
                Table {tableNumber}
              </p>
            </div>

          </div>

          {/* MOBILE MENU  */}

          <div className="flex items-center gap-3 sm:hidden">

            {/* Cart icon always visible */}

            <Link
              href={`/cart/${tableNumber}`}
              className="relative text-white"
            >
             <ShoppingCart className="h-5 w-5" />

              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Menu Toggle */}

            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="text-white"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <MenuSquare className="h-5 w-5" />}
            </button>

          </div>

        </div>

      </div>

      {/*  MOBILE DROPDOWN */}

      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute right-4 top-16 w-44 bg-white rounded-xl shadow-xl border md:hidden"
        >

          <div className="flex flex-col">

            <Link
              href={`/menu/${tableNumber}`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
            >
              <UtensilsCrossed className="h-5 w-5 text-gray-700" />
              <span className="text-sm text-gray-700">Menu</span>
            </Link>

            <Link
              href={`/orders/${tableNumber}`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 relative"
            >
              <Clipboard className="h-5 w-5 text-gray-700" />
              <span className="text-sm text-gray-700">Orders</span>

              {orderCount > 0 && (
                <span className="absolute right-4 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {orderCount}
                </span>
              )}
            </Link>

            <div className="border-t px-4 py-3">
              <p className="text-xs text-gray-500 uppercase">
                Ordering at
              </p>
              <p className="text-sm font-semibold text-gray-800">
                Table {tableNumber}
              </p>
            </div>

          </div>

        </div>
      )}

    </nav>
  )
}