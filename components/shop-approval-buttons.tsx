"use client";

import { useTransition } from "react";
import { ShopStatus } from "@prisma/client";
import { updateShopStatusAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Check, X, Ban, RefreshCw } from "lucide-react";

export function ShopApprovalButtons({
  shopId,
  currentStatus = "PENDING",
}: {
  shopId: string;
  currentStatus?: ShopStatus;
}) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (status: ShopStatus) => {
    startTransition(async () => {
      await updateShopStatusAction(shopId, status);
    });
  };

  if (currentStatus === "PENDING") {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <Button
          size="sm"
          onClick={() => handleUpdate("ACTIVE")}
          disabled={isPending}
          className="h-7 text-xs bg-green-700 hover:bg-green-800 text-white"
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          Approve
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUpdate("REJECTED")}
          disabled={isPending}
          className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Reject
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {currentStatus === "ACTIVE" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUpdate("SUSPENDED")}
          disabled={isPending}
          className="h-7 text-xs text-amber-700 hover:bg-amber-50 border-amber-200"
        >
          <Ban className="h-3 w-3 mr-1" />
          Suspend
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={() => handleUpdate("ACTIVE")}
          disabled={isPending}
          className="h-7 text-xs bg-green-700 hover:bg-green-800 text-white"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Activate
        </Button>
      )}
    </div>
  );
}
