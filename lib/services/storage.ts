import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 4 * 1024 * 1024;

export interface StorageAdapter {
  save(file: File): Promise<string>;
}

export const localStorageAdapter: StorageAdapter = {
  async save(file) {
    if (!ALLOWED.has(file.type)) {
      throw new Error("Unsupported image type");
    }
    if (file.size > MAX_BYTES) {
      throw new Error("Image must be under 4MB");
    }
    const ext = file.type.split("/")[1] ?? "jpg";
    const name = `${randomUUID()}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, name), buffer);
    return `/uploads/${name}`;
  },
};

export async function saveImage(file: File) {
  return localStorageAdapter.save(file);
}
