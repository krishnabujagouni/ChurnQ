import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe-server";

export async function POST() {
  const { userId, orgId } = auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const where = orgId ? { clerkOrgId: orgId } : { clerkUserId: userId };
  const tenant = await prisma.tenant.findUnique({ where });

  if (!tenant?.stripeConnectId) {
    return NextResponse.json({ error: "not_connected" }, { status: 400 });
  }

  // Deauthorize on Stripe's side
  try {
    const stripe = getStripe();
    await stripe.oauth.deauthorize({
      client_id: process.env.STRIPE_CLIENT_ID!,
      stripe_user_id: tenant.stripeConnectId,
    });
  } catch {
    // Stripe deauth can fail if the account was already disconnected on their side — proceed anyway
  }

  await prisma.tenant.update({
    where,
    data: { stripeConnectId: null },
  });

  return NextResponse.json({ ok: true });
}
