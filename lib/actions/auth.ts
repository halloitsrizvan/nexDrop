"use server";

import { hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { slugify } from "@/lib/utils";
import { registerCustomerSchema, registerShopSchema } from "@/lib/validations";

async function limitAuth(email: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for") ?? "local";
  const hit = rateLimit(`${ip}:${email}`);
  if (!hit.ok) throw new Error("Too many attempts. Try again in a minute.");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase();
  const password = String(formData.get("password") ?? "");
  await limitAuth(email);
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Invalid email or password" };
    throw error;
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.role === "SUPER_ADMIN") redirect("/admin");
  if (user?.role === "SHOP_OWNER") redirect("/dashboard");
  redirect("/account");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function registerCustomerAction(_: unknown, formData: FormData) {
  const parsed = registerCustomerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) return { error: "Check the form and try again." };
  await limitAuth(parsed.data.email);
  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (exists) return { error: "Email already registered." };
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash: await hash(parsed.data.password, 10),
      phone: parsed.data.phone,
      role: "CUSTOMER",
      customerProfile: { create: { phone: parsed.data.phone } },
    },
  });
  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirect: false,
  });
  redirect("/account");
}

export async function registerShopAction(_: unknown, formData: FormData) {
  const parsed = registerShopSchema.safeParse({
    ownerName: formData.get("ownerName"),
    email: formData.get("email"),
    password: formData.get("password"),
    shopName: formData.get("shopName"),
    phone: formData.get("phone"),
    pinCode: formData.get("pinCode"),
    address: formData.get("address"),
    businessCategory: formData.get("businessCategory"),
  });
  if (!parsed.success) return { error: "Check the form and try again." };
  await limitAuth(parsed.data.email);
  const email = parsed.data.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) {
    return { error: "Email already registered." };
  }
  let slug = slugify(parsed.data.shopName);
  const taken = await prisma.shop.findUnique({ where: { slug } });
  if (taken) slug = `${slug}-${Date.now().toString().slice(-4)}`;

  const user = await prisma.user.create({
    data: {
      name: parsed.data.ownerName,
      email,
      passwordHash: await hash(parsed.data.password, 10),
      phone: parsed.data.phone,
      role: "SHOP_OWNER",
    },
  });
  await prisma.shop.create({
    data: {
      name: parsed.data.shopName,
      slug,
      status: "PENDING",
      ownerId: user.id,
      members: { create: { userId: user.id, role: "OWNER" } },
      settings: {
        create: {
          contactNumber: parsed.data.phone,
          email,
          address: parsed.data.address,
          pinCode: parsed.data.pinCode,
          businessCategory: parsed.data.businessCategory,
        },
      },
    },
  });
  await signIn("credentials", {
    email,
    password: parsed.data.password,
    redirect: false,
  });
  redirect("/dashboard");
}
