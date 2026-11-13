/**
 * Shiprocket integration seam. No live courier calls in this prototype.
 */
export type ShipmentDraft = {
  orderId: string;
  pinCode: string;
  weightGrams?: number;
};

export interface ShippingProvider {
  createShipment(draft: ShipmentDraft): Promise<{ trackingId: string }>;
  getTracking(trackingId: string): Promise<{ status: string } | null>;
}

export const shiprocketProvider: ShippingProvider = {
  async createShipment() {
    throw new Error("Shiprocket is not connected");
  },
  async getTracking() {
    return null;
  },
};

export function isPinServiceable(serviceablePins: string[], pinCode: string) {
  if (serviceablePins.length === 0) return true;
  return serviceablePins.includes(pinCode.trim());
}
