"use client";

import { useState, useTransition } from "react";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatusAction } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, ArrowRight } from "lucide-react";

const NEXT_STATUS_OPTIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "READY_FOR_PICKUP", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  READY_FOR_PICKUP: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["RETURN_REQUESTED", "REFUNDED"],
  RETURN_REQUESTED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export function OrderStatusController({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const [selectedNext, setSelectedNext] = useState<OrderStatus | "">("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const options = NEXT_STATUS_OPTIONS[currentStatus] || [];

  const handleUpdate = () => {
    if (!selectedNext) return;
    setError(null);

    startTransition(async () => {
      const res = await updateOrderStatusAction({
        orderId,
        nextStatus: selectedNext as OrderStatus,
        note: note.trim() || undefined,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        setSelectedNext("");
        setNote("");
      }
    });
  };

  if (options.length === 0) {
    return (
      <p className="text-xs text-slate-500 italic">
        This order is in a final state ({currentStatus}) and cannot be transitioned further.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="next-status" className="text-xs">Next Status</Label>
        <select
          id="next-status"
          value={selectedNext}
          onChange={(e) => setSelectedNext(e.target.value as OrderStatus)}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs focus:ring-2 focus:ring-green-700"
          disabled={isPending}
        >
          <option value="">Select Next Status...</option>
          {options.map((st) => (
            <option key={st} value={st}>
              Move to {st}
            </option>
          ))}
        </select>
      </div>

      {selectedNext && (
        <div className="space-y-1.5">
          <Label htmlFor="status-note" className="text-xs">Transition Note (optional)</Label>
          <Input
            id="status-note"
            placeholder="e.g. Dispatched via local delivery partner"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-8 text-xs bg-white"
            disabled={isPending}
          />
        </div>
      )}

      <Button
        type="button"
        size="sm"
        disabled={!selectedNext || isPending}
        onClick={handleUpdate}
        className="w-full h-8 text-xs font-semibold"
      >
        {isPending ? "Updating..." : "Confirm Status Transition"}
      </Button>
    </div>
  );
}
