import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

export default function SuspendedShopPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Shop Under Review or Suspended</CardTitle>
          <CardDescription>
            Your shop account is currently pending approval by the platform administrator or has been suspended.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Please contact support at <a href="mailto:hello@nexdrop.local" className="text-green-800 underline">hello@nexdrop.local</a> for assistance.
          </p>
          <div className="flex justify-center gap-3">
            <form action={logoutAction}>
              <Button variant="outline" type="submit">Sign Out</Button>
            </form>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
