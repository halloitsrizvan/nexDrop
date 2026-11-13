"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PaymentMethod } from "@prisma/client";
import { formatInr, productPrice } from "@/lib/utils";
import {
  placeOnlineOrderAction,
  placeGuestOrderAction,
  createAddressAction,
} from "@/lib/actions/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Plus,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
} from "lucide-react";

interface CustomerAddress {
  id: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pinCode: string;
  phone?: string | null;
  isDefault: boolean;
}

interface CartItemData {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    discountPrice: number | null;
  };
}

export function StorefrontCheckoutView({
  shopId,
  shopSlug,
  addresses,
  cartItems: initialCartItems,
  deliveryCharge,
  freeDeliveryAbove,
  isLoggedIn = true,
}: {
  shopId: string;
  shopSlug: string;
  addresses: CustomerAddress[];
  cartItems: CartItemData[];
  deliveryCharge: number;
  freeDeliveryAbove: number | null;
  isLoggedIn?: boolean;
}) {
  const router = useRouter();
  const [cartItems] = useState<CartItemData[]>(() => {
    if (initialCartItems && initialCartItems.length > 0) return initialCartItems;
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(`nexdrop_cart_${shopId}`);
      if (stored) {
        const parsed = JSON.parse(stored) as Array<{
          id: string;
          name: string;
          price: number;
          discountPrice: number | null;
          quantity: number;
        }>;
        return parsed.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          product: {
            id: item.id,
            name: item.name,
            price: item.price,
            discountPrice: item.discountPrice,
          },
        }));
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? ""
  );
  const [showNewAddress, setShowNewAddress] = useState(addresses.length === 0 && isLoggedIn);
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Guest details form state
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // Address creation form state
  const [newLabel, setNewLabel] = useState("Home");
  const [newLine1, setNewLine1] = useState("");
  const [newLine2, setNewLine2] = useState("");
  const [newCity, setNewCity] = useState("Kochi");
  const [newState, setNewState] = useState("Kerala");
  const [newPinCode, setNewPinCode] = useState("682001");
  const [newPhone, setNewPhone] = useState("");

  const subtotal = cartItems.reduce((sum, item) => {
    const unit = productPrice({
      price: item.product.price,
      discountPrice: item.product.discountPrice,
    });
    return sum + unit * item.quantity;
  }, 0);

  const isFreeDelivery =
    freeDeliveryAbove !== null && subtotal >= freeDeliveryAbove;
  const delivery = isFreeDelivery ? 0 : deliveryCharge;
  const total = subtotal + delivery;

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("label", newLabel);
    fd.set("line1", newLine1);
    fd.set("line2", newLine2);
    fd.set("city", newCity);
    fd.set("state", newState);
    fd.set("pinCode", newPinCode);
    fd.set("phone", newPhone);
    fd.set("isDefault", "true");

    startTransition(async () => {
      const res = await createAddressAction(fd);
      if (res?.error) {
        setError(res.error);
      } else if (res?.addressId) {
        setSelectedAddressId(res.addressId);
        setShowNewAddress(false);
      }
    });
  };

  const handlePlaceOrder = () => {
    setError(null);

    // If Guest Checkout
    if (!isLoggedIn) {
      if (!guestName.trim() || !guestPhone.trim() || !newLine1.trim()) {
        setError("Please enter your name, mobile number, and delivery address.");
        return;
      }
      if (cartItems.length === 0) {
        setError("Your cart is empty.");
        return;
      }

      startTransition(async () => {
        const res = await placeGuestOrderAction({
          shopId,
          customerName: guestName.trim(),
          phone: guestPhone.trim(),
          address: {
            line1: newLine1.trim(),
            city: newCity.trim() || "Kochi",
            state: newState.trim() || "Kerala",
            pinCode: newPinCode.trim() || "682001",
          },
          items: cartItems.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          paymentMethod,
        });

        if (res?.error) {
          setError(res.error);
        } else if (res?.orderNumber) {
          setSuccessOrder(res.orderNumber);
          try {
            localStorage.removeItem(`nexdrop_cart_${shopId}`);
            window.dispatchEvent(new CustomEvent("cart-updated"));
          } catch {
            // ignore
          }
        }
      });
      return;
    }

    // If Logged in Checkout
    if (!selectedAddressId) {
      setError("Please select or add a delivery address.");
      return;
    }

    startTransition(async () => {
      const res = await placeOnlineOrderAction({
        shopId,
        addressId: selectedAddressId,
        couponCode: couponCode.trim() || undefined,
        paymentMethod,
      });

      if (res?.error) {
        setError(res.error);
      } else if (res?.orderId) {
        router.push(`/account/orders/${res.orderId}`);
      }
    });
  };

  if (successOrder) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-5">
        <div className="h-16 w-16 rounded-full bg-[#DEF3E3] text-[#00B074] mx-auto flex items-center justify-center">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-[#00B074] text-xs font-bold">
            Order Confirmed!
          </span>
          <h2 className="text-2xl font-black text-slate-900">
            Thank you, {guestName || "Customer"}!
          </h2>
          <p className="text-xs text-slate-500">
            Your fresh grocery order has been scheduled for fast neighborhood delivery.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2 text-xs border border-slate-100">
          <div className="flex justify-between">
            <span className="text-slate-400">Order Reference:</span>
            <span className="font-mono font-bold text-[#00B074]">#{successOrder}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Payment:</span>
            <span className="font-bold text-slate-800">
              {paymentMethod === "COD" ? "Cash on Delivery" : "UPI on Delivery"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Amount:</span>
            <span className="font-mono font-black text-slate-900">{formatInr(total)}</span>
          </div>
        </div>

        <Button
          onClick={() => router.push(`/shop/${shopSlug}`)}
          className="w-full bg-[#00B074] hover:bg-[#009663] text-white font-bold text-xs h-10 rounded-xl"
        >
          Return to Storefront
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Checkout
        </h1>
        <p className="text-xs text-slate-500">
          Complete your delivery details and choose a payment method
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Addresses & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Delivery & Customer Details Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#00B074]" />
                {isLoggedIn ? "Delivery Address" : "Guest Customer Details (No Sign-Up Required)"}
              </CardTitle>
              {isLoggedIn && addresses.length > 0 && !showNewAddress && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewAddress(true)}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Address
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {!isLoggedIn ? (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <User className="h-3 w-3 text-[#00B074]" />
                        Your Full Name *
                      </Label>
                      <Input
                        placeholder="e.g. Anand Kumar"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="h-9 text-xs text-slate-900 font-medium"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-[#00B074]" />
                        Mobile Number *
                      </Label>
                      <Input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="h-9 text-xs text-slate-900 font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-[#00B074]" />
                      Delivery Address *
                    </Label>
                    <Input
                      placeholder="House / Flat No., Street, Landmark"
                      value={newLine1}
                      onChange={(e) => setNewLine1(e.target.value)}
                      className="h-9 text-xs text-slate-900 font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-700">City</Label>
                      <Input
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="h-9 text-xs text-slate-900 font-medium"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-700">State</Label>
                      <Input
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        className="h-9 text-xs text-slate-900 font-medium"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-700">PIN Code</Label>
                      <Input
                        value={newPinCode}
                        onChange={(e) => setNewPinCode(e.target.value)}
                        className="h-9 text-xs text-slate-900 font-medium"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {!showNewAddress && addresses.length > 0 && (
                    <div className="space-y-2">
                      {addresses.map((a) => (
                        <label
                          key={a.id}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                            selectedAddressId === a.id
                              ? "border-green-700 bg-green-50/30 ring-1 ring-green-700"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === a.id}
                            onChange={() => setSelectedAddressId(a.id)}
                            className="mt-0.5 text-green-800 focus:ring-green-700"
                          />
                          <div className="space-y-0.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{a.label}</span>
                              {a.isDefault && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-slate-700">{a.line1}</p>
                            {a.line2 && <p className="text-slate-500">{a.line2}</p>}
                            <p className="text-slate-600">
                              {a.city}, {a.state} - {a.pinCode}
                            </p>
                            {a.phone && <p className="text-slate-500 pt-0.5">Phone: {a.phone}</p>}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

              {/* Add New Address Form */}
              {showNewAddress && (
                <form onSubmit={handleCreateAddress} className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input
                        placeholder="Home / Office"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        className="h-8 text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Contact Phone</Label>
                      <Input
                        placeholder="+91 9876543210"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Address Line 1 *</Label>
                    <Input
                      placeholder="Flat, House no., Building, Apartment"
                      value={newLine1}
                      onChange={(e) => setNewLine1(e.target.value)}
                      className="h-8 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Address Line 2 (optional)</Label>
                    <Input
                      placeholder="Area, Street, Landmark"
                      value={newLine2}
                      onChange={(e) => setNewLine2(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">City</Label>
                      <Input
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="h-8 text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">State</Label>
                      <Input
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        className="h-8 text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">PIN Code</Label>
                      <Input
                        value={newPinCode}
                        onChange={(e) => setNewPinCode(e.target.value)}
                        maxLength={6}
                        className="h-8 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" size="sm" className="h-8 text-xs" disabled={isPending}>
                      {isPending ? "Saving..." : "Save & Use Address"}
                    </Button>
                    {addresses.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewAddress(false)}
                        className="h-8 text-xs"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </>
          )}
        </CardContent>
      </Card>

          {/* Payment Method Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-800" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-green-700 bg-green-50/30 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="text-green-800 focus:ring-green-700"
                />
                <div>
                  <span className="font-bold text-slate-900 block">
                    Cash on Delivery (COD)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Pay with cash or UPI upon home delivery
                  </span>
                </div>
              </label>
            </CardContent>
          </Card>
        </div>

        {/* Right: Order Summary & Placement (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
            Review Order
          </h3>

          {/* Items Preview */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
            {cartItems.map((item) => {
              const unit = productPrice({
                price: item.product.price,
                discountPrice: item.product.discountPrice,
              });
              return (
                <div key={item.id} className="flex justify-between py-1 border-b border-slate-50">
                  <div className="overflow-hidden pr-2">
                    <p className="font-medium text-slate-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-mono font-semibold text-slate-800 shrink-0">
                    {formatInr(unit * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Coupon Code Input */}
          <div className="pt-2">
            <Label className="text-xs text-slate-600 block mb-1">Coupon Code</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. WELCOME10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="h-8 text-xs font-mono uppercase bg-slate-50"
              />
              <Button type="button" variant="outline" size="sm" className="h-8 text-xs">
                Apply
              </Button>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono">{formatInr(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery</span>
              <span className="font-mono">
                {delivery === 0 ? <strong className="text-[#00B074]">FREE</strong> : formatInr(delivery)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total Payable</span>
              <span className="text-[#FF5C00] font-mono font-black text-lg">{formatInr(total)}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="orange"
            onClick={handlePlaceOrder}
            disabled={
              isPending ||
              (!isLoggedIn
                ? !guestName.trim() || !guestPhone.trim() || !newLine1.trim()
                : !selectedAddressId)
            }
            className="w-full h-12 rounded-2xl text-sm font-black shadow-md shadow-orange-500/20"
          >
            {isPending ? "Placing Order..." : `Confirm & Place Order (${formatInr(total)})`}
          </Button>

          <p className="text-[11px] text-center text-slate-400">
            Payment verified by {paymentMethod} on delivery.
          </p>
        </div>
      </div>
    </div>
  );
}
