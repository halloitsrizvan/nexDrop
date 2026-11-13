import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Check } from "lucide-react";
import { CustomerAddressManager } from "@/components/customer-address-manager";

export default async function CustomerAddressesPage() {
  const user = await requireSession();

  const addressesRaw = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: { isDefault: "desc" },
  });

  const addresses = addressesRaw.map((a) => ({
    id: a.id,
    label: a.label,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    pinCode: a.pinCode,
    phone: a.phone,
    isDefault: a.isDefault,
  }));

  return <CustomerAddressManager addresses={addresses} />;
}
