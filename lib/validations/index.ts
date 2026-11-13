import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerCustomerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(8).optional(),
});

export const registerShopSchema = z.object({
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  shopName: z.string().min(2),
  phone: z.string().min(8),
  pinCode: z.string().min(6).max(6),
  address: z.string().min(6),
  businessCategory: z.string().min(2),
});

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  sku: z.string().min(2),
  brand: z.string().optional(),
  categoryId: z.string().optional(),
  price: z.coerce.number().positive(),
  discountPrice: z.coerce.number().positive().optional().or(z.literal("")),
  stockQuantity: z.coerce.number().int().min(0),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  featured: z.coerce.boolean().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2),
});

export const stockAdjustSchema = z.object({
  productId: z.string(),
  type: z.enum(["ADDED", "DEDUCTED", "ADJUSTED"]),
  quantity: z.coerce.number().int().positive(),
  reason: z.string().min(2),
});

export const couponSchema = z.object({
  code: z.string().min(3),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.coerce.number().positive(),
  minOrder: z.coerce.number().min(0).optional(),
  active: z.coerce.boolean().optional(),
});

export const addressSchema = z.object({
  label: z.string().min(1),
  line1: z.string().min(4),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pinCode: z.string().min(6).max(6),
  phone: z.string().min(8).optional().or(z.literal("")),
  isDefault: z.coerce.boolean().optional(),
});

export const shopSettingsSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  pinCode: z.string().optional(),
  businessCategory: z.string().optional(),
  openingHours: z.string().optional(),
  deliveryEnabled: z.coerce.boolean().optional(),
  pickupEnabled: z.coerce.boolean().optional(),
  deliveryCharge: z.coerce.number().min(0),
  minOrderValue: z.coerce.number().min(0),
  storeOpen: z.coerce.boolean().optional(),
});

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional(),
});
