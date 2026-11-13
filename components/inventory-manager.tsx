"use client";

import { useState, useTransition } from "react";
import { adjustStockAction } from "@/lib/actions/catalog";
import { formatInr } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Boxes,
  History,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { format } from "date-fns";

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
}

interface MovementItem {
  id: string;
  type: "ADDED" | "DEDUCTED" | "ADJUSTED";
  quantity: number;
  reason: string;
  createdAt: string;
  productName: string;
  sku: string;
  userName?: string | null;
}

export function InventoryManager({
  inventoryItems,
  recentMovements,
}: {
  inventoryItems: InventoryItem[];
  recentMovements: MovementItem[];
}) {
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<"ADDED" | "DEDUCTED" | "ADJUSTED">("ADDED");
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState<string>("Supplier Restock");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const filtered = inventoryItems.filter(
    (i) =>
      i.productName.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdjust = () => {
    if (!selectedProduct) return;
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const fd = new FormData();
      fd.set("productId", selectedProduct.productId);
      fd.set("quantity", String(quantity));
      fd.set("type", adjustType);
      fd.set("reason", reason);
      const res = await adjustStockAction(fd);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setSelectedProduct(null);
          setSuccess(false);
        }, 1200);
      }
    });
  };

  const lowStockCount = inventoryItems.filter((i) => i.quantity <= 5).length;
  const totalStockUnits = inventoryItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Inventory Control
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time stock audit, inventory adjustments, and automated stock alerts
        </p>
      </div>

      {/* KPI Cards styled like Image 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#E6F7F0] text-[#00B074] flex items-center justify-center font-bold">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Total Units in Stock</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono mt-0.5">
              {totalStockUnits}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#FFF2EC] text-[#FF5C00] flex items-center justify-center font-bold">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Low Stock Products</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono mt-0.5">
              {lowStockCount}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <History className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Stock Movements Logged</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono mt-0.5">
              {recentMovements.length}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Stock Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-extrabold text-slate-900 text-lg">Product Stock Levels</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search stock..."
                className="pl-9 h-9 text-xs rounded-xl bg-slate-50 border-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-100 text-slate-400 text-xs">
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Current Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow
                    key={item.id}
                    className={`border-b border-slate-50 hover:bg-slate-50/70 transition-colors ${
                      selectedProduct?.id === item.id ? "bg-[#FFF2EC]/40" : ""
                    }`}
                  >
                    <TableCell className="font-bold text-xs sm:text-sm text-slate-900">
                      {item.productName}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400">
                      {item.sku}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-black text-sm text-slate-900">
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.quantity <= 5 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-500">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F7F0] text-[#00B074]">
                          In Stock
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={selectedProduct?.id === item.id ? "orange" : "outline"}
                        size="sm"
                        onClick={() => setSelectedProduct(item)}
                        className="rounded-xl h-8 text-xs font-bold"
                      >
                        Adjust
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Adjust Stock Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-lg">Stock Adjustment</h3>

          {selectedProduct ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block">Selected</span>
                <p className="font-extrabold text-slate-900 text-sm">{selectedProduct.productName}</p>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  Current Stock: <strong>{selectedProduct.quantity} units</strong>
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Adjustment Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["ADDED", "DEDUCTED", "ADJUSTED"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAdjustType(type)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                        adjustType === type
                          ? "bg-[#FFF2EC] text-[#FF5C00] border border-[#FFD7C2]"
                          : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {type === "ADDED" ? "+ Add" : type === "DEDUCTED" ? "- Deduct" : "= Set"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Quantity</Label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="rounded-xl font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Reason / Reference</Label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="rounded-xl text-xs"
                  placeholder="e.g. Supplier Shipment, Physical Audit"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 font-medium">{error}</p>
              )}
              {success && (
                <p className="text-xs text-[#00B074] font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Stock updated successfully!
                </p>
              )}

              <Button
                variant="orange"
                onClick={handleAdjust}
                disabled={isPending}
                className="w-full rounded-2xl font-bold h-10 shadow-xs"
              >
                {isPending ? "Updating..." : "Confirm Stock Adjustment"}
              </Button>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              Click &quot;Adjust&quot; on any product in the table to modify its inventory.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
