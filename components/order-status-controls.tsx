"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface Props {
  orderId: string
  currentStatus: string
}

// All possible statuses we may target via actions (demo scope)
type ActionStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled"

export default function OrderStatusControls({ orderId, currentStatus }: Props) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  // Determine next logical actions for demo purposes
  const actions: { label: string; to: ActionStatus }[] = []

  // From pending or paid -> processing
  if (currentStatus === "pending" || currentStatus === "paid") {
    actions.push({ label: "Mark Processing", to: "processing" })
  }
  // From processing -> shipped
  if (currentStatus === "processing") {
    actions.push({ label: "Mark Shipped", to: "shipped" })
  }
  // From shipped -> delivered
  if (currentStatus === "shipped") {
    actions.push({ label: "Mark Delivered", to: "delivered" })
  }

  // Allow cancel if not yet shipped/delivered
  if (["pending", "paid", "processing"].includes(currentStatus)) {
    actions.push({ label: "Cancel Order", to: "cancelled" as ActionStatus })
  }

  if (actions.length === 0) return null

  const updateStatus = async (to: ActionStatus) => {
    try {
      setIsUpdating(to)
      let trackingNumber: string | undefined
      if (to === "shipped") {
        trackingNumber = window.prompt("Enter tracking number (optional)") || undefined
      }
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: to, trackingNumber }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error || "Failed to update order status")
        return
      }
      router.refresh()
    } catch (e) {
      console.error(e)
      alert("Unexpected error updating status")
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {actions.map((a) => (
        <Button
          key={a.to}
          variant={a.to === "cancelled" ? "outline" : "default"}
          className={a.to === "cancelled" ? "text-red-600 hover:text-red-700" : ""}
          onClick={() => updateStatus(a.to)}
          disabled={!!isUpdating}
        >
          {isUpdating === a.to ? "Updating…" : a.label}
        </Button>
      ))}
    </div>
  )
}
