"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Copy, Truck } from "lucide-react"

interface Props {
  trackingNumber: string
  shippedAt?: string | null
}

export default function TrackPackageButton({ trackingNumber, shippedAt }: Props) {
  const [open, setOpen] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(trackingNumber)
      // no toast lib imported here; keep it simple
      alert("Tracking number copied")
    } catch (e) {
      alert("Failed to copy tracking number")
    }
  }

  const shippedDate = shippedAt ? new Date(shippedAt).toLocaleString() : undefined

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start bg-transparent">
          <Truck className="h-4 w-4 mr-2" /> Track Package
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Track your shipment</DialogTitle>
          <DialogDescription>
            Use this tracking number on your carrier's website to get real-time updates.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {shippedDate && (
            <p className="text-sm text-slate-600">Shipped on {shippedDate}</p>
          )}
          <div className="flex items-center gap-2">
            <Input value={trackingNumber} readOnly className="font-mono" />
            <Button variant="outline" onClick={copy} aria-label="Copy tracking number">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-slate-600">
            Tip: If you recognize the carrier (UPS, FedEx, USPS, DHL), paste into their tracking page.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
