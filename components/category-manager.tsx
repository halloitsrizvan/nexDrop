"use client";

import { useTransition, useState } from "react";
import { createCategoryAction, deleteCategoryAction } from "@/lib/actions/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Layers, AlertCircle } from "lucide-react";

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

export function CategoryManager({ categories }: { categories: CategoryWithCount[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("name", name);

    startTransition(async () => {
      const res = await createCategoryAction(fd);
      if (res?.error) setError(res.error);
      else setName("");
    });
  };

  const handleDelete = (id: string, count: number) => {
    if (count > 0) {
      alert("Cannot delete category containing products. Reassign or delete the products first.");
      return;
    }
    if (!confirm("Are you sure you want to delete this category?")) return;
    startTransition(async () => {
      await deleteCategoryAction(id);
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categories</h1>
        <p className="text-sm text-slate-500">
          Organize your product catalog for easier discovery on your storefront
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Category Form */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4 text-green-700" />
              Add Category
            </CardTitle>
            <CardDescription className="text-xs">
              e.g. Spices, Dairy, Bakery, Beverages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  placeholder="e.g. Fresh Produce"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending || !name.trim()}>
                {isPending ? "Adding..." : "Add Category"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Categories List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-slate-500" />
              Existing Categories ({categories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No categories created yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium text-slate-900 text-xs">
                        {cat.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-400">
                        {cat.slug}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 font-mono">
                        {cat._count.products} items
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cat.id, cat._count.products)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
