import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { razorpay, PLAN_PRICES } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!plan || !PLAN_PRICES[plan]) {
      return NextResponse.json(
        { error: "Invalid plan selected. Must be STARTER, PRO, or AGENCY" },
        { status: 400 }
      );
    }

    const business = await prisma.business.findUnique({
      where: { clerkUserId: userId },
      include: { subscription: true },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business profile not found. Please register your business first." },
        { status: 404 }
      );
    }

    const planInfo = PLAN_PRICES[plan];
    const receipt = `rcpt_${business.id.slice(-8)}_${Date.now().toString().slice(-6)}`;

    // Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: planInfo.amount,
      currency: planInfo.currency,
      receipt,
      notes: {
        businessId: business.id,
        clerkUserId: userId,
        plan,
        businessName: business.businessName,
      },
    });

    // Save order ID to Subscription record
    if (business.subscription) {
      await prisma.subscription.update({
        where: { id: business.subscription.id },
        data: { razorpayOrderId: order.id },
      });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      businessName: business.businessName,
      ownerName: business.ownerName,
      ownerEmail: business.email,
      ownerPhone: business.phone,
      plan,
    });
  } catch (error) {
    console.error("[RAZORPAY_CREATE_ORDER_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create payment order. Check server keys." },
      { status: 500 }
    );
  }
}
