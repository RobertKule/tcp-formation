"use client"

import { cn } from "@/lib/utils"

interface PaymentProgressProps {
  totalPaid: number
  totalPrice: number
  className?: string
}

export function PaymentProgress({ totalPaid, totalPrice, className }: PaymentProgressProps) {
  const percentage = totalPrice > 0 ? Math.min(Math.round((totalPaid / totalPrice) * 100), 100) : 0
  
  let colorClass = "bg-orange-500"
  if (percentage >= 100) {
    colorClass = "bg-green-500"
  } else if (percentage >= 50) {
    colorClass = "bg-blue-500"
  }

  return (
    <div className={cn("space-y-1 w-full", className)}>
      <div className="flex justify-between text-xs font-medium">
        <span>Paiement: {percentage}%</span>
        <span>{totalPaid}$ / {totalPrice}$</span>
      </div>
      <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500", colorClass)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
