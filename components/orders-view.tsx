"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { formatInr } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ShoppingBag, ArrowRight, Filter, ChevronRight } from "lucide-react";

interface OrderItemSummary {
  id: string;
  orderNumber: string;
  channel: "ONLINE" | "POS";
  status: string;
  total: number;
  itemCount: number;
  customerName: string;
  createdAt: string;
  paymentMethod: string;
}

export function OrdersView({ orders }: { orders: OrderItemSummary[] }) {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesChannel =
      channelFilter === "ALL" || o.channel === channelFilter;
    const matchesStatus =
      statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesChannel && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Order Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track online customer orders, POS checkout receipts, and fulfillment status
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by order #, customer name..."
              className="pl-10 h-10 bg-slate-50 border-slate-200 rounded-2xl text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs">
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
              {["ALL", "ONLINE", "POS"].map((channel) => (
                <button
                  key={channel}
                  onClick={() => setChannelFilter(channel)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    channelFilter === channel
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {channel === "ALL" ? "All Channels" : channel}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900 text-lg">
            Recent Orders ({filtered.length})
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="p-16 text-center rounded-2xl border border-dashed border-slate-200">
            <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">No orders match the filter</p>
            <p className="text-xs text-slate-400 mt-1">
              New orders made in-store or online will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-100 text-slate-400 text-xs">
                  <TableHead>Order #</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow
                    key={order.id}
                    className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors"
                  >
                    <TableCell className="font-mono font-bold text-xs text-slate-900">
                      {order.orderNumber}
                      <span className="block text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                        {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.channel === "POS"
                            ? "bg-[#FFF2EC] text-[#FF5C00]"
                            : "bg-[#E6F7F0] text-[#00B074]"
                        }`}
                      >
                        {order.channel}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">
                      {order.customerName}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-500">
                      {order.itemCount} items
                    </TableCell>
                    <TableCell className="font-mono font-black text-xs text-slate-900">
                      {formatInr(order.total)}
                    </TableCell>
                    <TableCell className="text-[11px] font-medium text-slate-500">
                      {order.paymentMethod}
                    </TableCell>
                    <TableCell>
                      {order.status === "DELIVERED" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F7F0] text-[#00B074]">
                          Delivered
                        </span>
                      ) : order.status === "CANCELLED" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-500">
                          Cancelled
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF2EC] text-[#FF5C00]">
                          {order.status}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl h-8 text-xs font-bold text-slate-600 hover:text-[#FF5C00]"
                        asChild
                      >
                        <Link href={`/dashboard/orders/${order.id}`}>
                          View Details
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
