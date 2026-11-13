"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProductAction, updateProductAction, deleteProductAction } from "@/lib/actions/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Upload, Trash2, Plus, Image as ImageIcon } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductInitialData {
  id: string;
  name: string;
  description?: string | null;
  sku: string;
  brand?: string | null;
  categoryId?: string | null;
  price: number;
  discountPrice?: number | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  featured: boolean;
  images: string[];
  stockQuantity?: number;
}

export function ProductForm({
  categories,
  initialData,
}: {
  categories: CategoryOption[];
  initialData?: ProductInitialData;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const isEditing = !!initialData;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to upload image");
      setImages((prev) => [...prev, data.url]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput("");
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("images", JSON.stringify(images));

    startTransition(async () => {
      if (isEditing) {
        const res = await updateProductAction(initialData.id, fd);
        if (res?.error) setError(res.error);
        else router.push("/dashboard/products");
      } else {
        const res = await createProductAction(fd);
        if (res?.error) setError(res.error);
      }
    });
  };

  const handleDelete = () => {
    if (!initialData || !confirm("Are you sure you want to delete this product?")) return;
    startTransition(async () => {
      await deleteProductAction(initialData.id);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {isEditing ? `Edit: ${initialData.name}` : "New Product"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
          <Button variant="orange" type="submit" disabled={isPending || uploading} className="rounded-xl font-bold">
            {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={initialData?.name}
                  placeholder="e.g. Traditional Palakkadan Matta Rice 5kg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    name="sku"
                    defaultValue={initialData?.sku}
                    placeholder="e.g. RICE-MATTA-5K"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    name="brand"
                    defaultValue={initialData?.brand ?? ""}
                    placeholder="e.g. Nirapara / Homemade"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={initialData?.description ?? ""}
                  placeholder="Product specifications, ingredients, origin..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="price">Regular Price (₹) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="1"
                    defaultValue={initialData?.price}
                    placeholder="299.00"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="discountPrice">Discount / Sale Price (₹)</Label>
                  <Input
                    id="discountPrice"
                    name="discountPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={initialData?.discountPrice ?? ""}
                    placeholder="249.00"
                  />
                </div>
              </div>

              {!isEditing && (
                <div className="space-y-1.5">
                  <Label htmlFor="stockQuantity">Initial Stock Quantity *</Label>
                  <Input
                    id="stockQuantity"
                    name="stockQuantity"
                    type="number"
                    min="0"
                    defaultValue={25}
                    placeholder="25"
                    required
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Product Images</CardTitle>
              <CardDescription className="text-xs">
                Upload image files or add image URLs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://images.unsplash.com/... or direct image URL"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={addImageUrl}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add URL
                </Button>
              </div>

              <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-green-600 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  {uploading ? "Uploading image..." : "Click or drop image to upload"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, WebP up to 4MB</p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-3 pt-2">
                  {images.map((url, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                      <img src={url} alt="Uploaded" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Controls (1 col) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Organization & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={initialData?.status ?? "ACTIVE"}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                >
                  <option value="ACTIVE">Active (Visible)</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="categoryId">Category</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={initialData?.categoryId ?? ""}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                >
                  <option value="">No Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  defaultChecked={initialData?.featured ?? false}
                  className="h-4 w-4 rounded border-slate-300 text-green-700 focus:ring-green-700"
                />
                <Label htmlFor="featured" className="text-xs cursor-pointer">
                  Featured Product (Show on storefront top carousel)
                </Label>
              </div>
            </CardContent>
          </Card>

          {!isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Variant Attributes (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="size">Size / Weight</Label>
                  <Input id="size" name="size" placeholder="e.g. 500g, 1kg, 5kg" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="color">Color / Type</Label>
                  <Input id="color" name="color" placeholder="e.g. Red, Standard" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </form>
  );
}
