import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { SubscriptionPlan } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      amount,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      return NextResponse.json(
        { error: "Missing required payment verification details" },
        { status: 400 }
      );
    }

    const business = await prisma.business.findUnique({
      where: { clerkUserId: userId },
      include: { subscription: true },
    });

    if (!business || !business.subscription) {
      return NextResponse.json(
        { error: "Business or Subscription not found" },
        { status: 404 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret";

    // Verify Razorpay Signature: hmac_sha256(order_id + "|" + payment_id, secret)
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      // Record failed payment attempt
      await prisma.payment.create({
        data: {
          subscriptionId: business.subscription.id,
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature,
          amount: amount || 0,
          currency: "INR",
          status: "FAILED",
        },
      });

      return NextResponse.json(
        { success: false, redirectUrl: "/payment/failure" },
        { status: 400 }
      );
    }

    // Calculation for subscription period (30 days)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Save payment & update subscription in transaction
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          subscriptionId: business.subscription.id,
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature,
          amount: amount || 0,
          currency: "INR",
          status: "SUCCESS",
        },
      }),
      prisma.subscription.update({
        where: { id: business.subscription.id },
        data: {
          plan: plan as SubscriptionPlan,
          status: "ACTIVE",
          razorpayOrderId: razorpay_order_id,
          startedAt: now,
          expiresAt,
          currentPeriodStart: now,
          currentPeriodEnd: expiresAt,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      redirectUrl: `/payment/success?payment_id=${razorpay_payment_id}&plan=${plan}&order_id=${razorpay_order_id}`,
    });
  } catch (error) {
    console.error("[RAZORPAY_VERIFY_ERROR]", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
