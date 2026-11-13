"use client";

import { useState, useTransition } from "react";
import { cancelCustomerOrderAction, requestOrderReturnAction } from "@/lib/actions/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, RotateCcw, XCircle } from "lucide-react";

export function CustomerOrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [showCancel, setShowCancel] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await cancelCustomerOrderAction(orderId, reason);
      if (res?.error) setError(res.error);
      else setShowCancel(false);
    });
  };

  const handleReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await requestOrderReturnAction(orderId, reason);
      if (res?.error) setError(res.error);
      else setShowReturn(false);
    });
  };

  if (status !== "PENDING" && status !== "DELIVERED") {
    return null;
  }

  return (
    <div className="pt-2">
      {error && (
        <div className="flex items-center gap-2 p-2.5 mb-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {status === "PENDING" && !showCancel && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCancel(true)}
          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <XCircle className="h-3.5 w-3.5 mr-1" />
          Cancel Order
        </Button>
      )}

      {status === "DELIVERED" && !showReturn && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowReturn(true)}
          className="text-xs text-slate-700 hover:bg-slate-100"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Request Return
        </Button>
      )}

      {showCancel && (
        <form onSubmit={handleCancel} className="space-y-2 p-3 bg-red-50/50 rounded-xl border border-red-200 text-xs">
          <Label className="text-xs font-semibold text-red-900">Reason for Cancellation</Label>
          <Input
            placeholder="e.g. Ordered by mistake, wrong address"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-8 text-xs bg-white"
            required
            disabled={isPending}
          />
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" size="sm" className="h-7 text-xs" disabled={isPending}>
              {isPending ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowCancel(false)} className="h-7 text-xs">
              Back
            </Button>
          </div>
        </form>
      )}

      {showReturn && (
        <form onSubmit={handleReturn} className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <Label className="text-xs font-semibold text-slate-900">Reason for Return</Label>
          <Input
            placeholder="e.g. Damaged packaging, wrong item delivered"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-8 text-xs bg-white"
            required
            disabled={isPending}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="h-7 text-xs" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Return Request"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowReturn(false)} className="h-7 text-xs">
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
