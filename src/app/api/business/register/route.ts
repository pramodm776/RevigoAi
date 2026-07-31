import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateUniqueSlug } from "@/lib/slug";

const RegisterBusinessSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Invalid phone number"),
  googleReviewUrl: z.string().url("Invalid Google Review URL"),
  category: z.enum([
    "RESTAURANT",
    "RETAIL",
    "HEALTHCARE",
    "BEAUTY",
    "FITNESS",
    "HOTEL",
    "AUTO",
    "EDUCATION",
    "FINANCE",
    "TECHNOLOGY",
    "OTHER",
  ]),
  address: z.string().min(5, "Address must be at least 5 characters"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = RegisterBusinessSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if this user already registered a business
    const existing = await prisma.business.findUnique({
      where: { clerkUserId: userId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Business already registered for this account", slug: existing.slug },
        { status: 409 }
      );
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(data.businessName);

    // Create business record with a default subscription
    const business = await prisma.business.create({
      data: {
        clerkUserId: userId,
        businessName: data.businessName,
        ownerName: data.ownerName,
        email: data.email,
        phone: data.phone,
        googleReviewUrl: data.googleReviewUrl,
        category: data.category,
        address: data.address,
        website: data.website || null,
        logoUrl: data.logoUrl || null,
        slug,
        subscription: {
          create: {
            plan: "FREE",
            status: "INACTIVE",
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        slug: business.slug,
        businessId: business.id,
        dashboardUrl: `/dashboard`,
        subscriptionUrl: `/subscription?business=${business.slug}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[BUSINESS_REGISTER_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
