import slugifyLib from "slugify";
import { prisma } from "./prisma";

/**
 * Generates a unique slug from a business name.
 * Format: `business-name-xxxx` where xxxx is a 4-char random hex suffix.
 */
export async function generateUniqueSlug(businessName: string): Promise<string> {
  const base = slugifyLib(businessName, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = base;
  let exists = await prisma.business.findUnique({ where: { slug } });

  while (exists) {
    const suffix = Math.random().toString(36).slice(2, 6);
    slug = `${base}-${suffix}`;
    exists = await prisma.business.findUnique({ where: { slug } });
  }

  return slug;
}
