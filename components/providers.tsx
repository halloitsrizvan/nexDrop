"use client";

import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "sonner";

export function Providers({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
      <Toaster position="top-right" richColors />
    </NextIntlClientProvider>
  );
}
