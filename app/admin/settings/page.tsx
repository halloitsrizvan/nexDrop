import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updatePlatformSettingAction } from "@/lib/actions/admin";

export default async function AdminSettingsPage() {
  await requireAdmin();

  const settings = await prisma.platformSetting.findMany();
  const getVal = (k: string) => settings.find((s) => s.key === k)?.value ?? "";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Platform Settings
        </h1>
        <p className="text-xs text-slate-500">
          Global platform operational configuration and support contacts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">General System Contacts</CardTitle>
          <CardDescription className="text-xs">
            Shown across notifications and storefront footers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            action={async (fd: FormData) => {
              "use server";
              const email = String(fd.get("supportEmail") ?? "");
              await updatePlatformSettingAction("supportEmail", email);
            }}
            className="flex items-end gap-3"
          >
            <div className="space-y-1 flex-1">
              <Label className="text-xs">Support Email Address</Label>
              <Input
                name="supportEmail"
                defaultValue={getVal("supportEmail") || "hello@nexdrop.local"}
                className="h-8 text-xs bg-white"
                required
              />
            </div>
            <Button type="submit" size="sm" className="h-8 text-xs">
              Save
            </Button>
          </form>

          <form
            action={async (fd: FormData) => {
              "use server";
              const notice = String(fd.get("broadcastNotice") ?? "");
              await updatePlatformSettingAction("broadcastNotice", notice);
            }}
            className="flex items-end gap-3"
          >
            <div className="space-y-1 flex-1">
              <Label className="text-xs">Platform Announcement Banner (optional)</Label>
              <Input
                name="broadcastNotice"
                defaultValue={getVal("broadcastNotice")}
                placeholder="e.g. Welcome new merchants to the NexDrop network!"
                className="h-8 text-xs bg-white"
              />
            </div>
            <Button type="submit" size="sm" className="h-8 text-xs">
              Save
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
