"use client"

import { useMemo } from "react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend
} from "recharts"
import { CashEntry } from "@prisma/client"
import { format, subDays, startOfDay, isSameDay } from "date-fns"
import { fr } from "date-fns/locale"

interface CashChartsProps {
  entries: CashEntry[]
}

export function CashCharts({ entries }: CashChartsProps) {
  const chartData = useMemo(() => {
    // Last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i)
      return startOfDay(date)
    }).reverse()

    return days.map(day => {
      const dayEntries = entries.filter(e => isSameDay(new Date(e.date), day))
      const entrees = dayEntries.filter(e => e.type === "ENTREE").reduce((sum, e) => sum + e.amount, 0)
      const sorties = dayEntries.filter(e => e.type === "SORTIE").reduce((sum, e) => sum + e.amount, 0)
      
      return {
        name: format(day, "EEE dd", { locale: fr }),
        Entrées: entrees,
        Sorties: sorties,
      }
    })
  }, [entries])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#94a3b8', fontSize: 12 }} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
          }} 
          cursor={{ fill: '#f8fafc' }}
        />
        <Legend 
          verticalAlign="top" 
          align="right" 
          iconType="circle"
          content={({ payload }) => (
            <div className="flex justify-end gap-6 mb-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              {payload?.map((entry: any, index: number) => (
                <div key={`item-${index}`} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.value}
                </div>
              ))}
            </div>
          )}
        />
        <Bar dataKey="Entrées" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
        <Bar dataKey="Sorties" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
      </BarChart>
    </ResponsiveContainer>
  )
}
