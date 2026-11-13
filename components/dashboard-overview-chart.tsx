"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatInr } from "@/lib/utils";

interface ChartPoint {
  date: string;
  revenue: number;
  orders: number;
}

export function DashboardOverviewChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="h-[280px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF5C00" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#FF5C00" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#94A3B8" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as ChartPoint;
                return (
                  <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-lg text-xs">
                    <p className="font-bold text-slate-800">{item.date}</p>
                    <p className="text-[#FF5C00] font-black mt-1 font-mono">
                      Revenue: {formatInr(item.revenue)}
                    </p>
                    <p className="text-slate-400 font-medium">Orders: {item.orders}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#FF5C00"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRev)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
