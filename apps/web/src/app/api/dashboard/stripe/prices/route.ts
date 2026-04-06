import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe-server";

export type StripePriceOption = {
  priceId: string;
  productName: string;
  amount: number; // monthly USD
  interval: string;
  currency: string;
};

export async function GET() {
  const { userId, orgId } = auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const tenant = orgId
    ? await prisma.tenant.findUnique({ where: { clerkOrgId: orgId } })
    : await prisma.tenant.findUnique({ where: { clerkUserId: userId } });

  if (!tenant?.stripeConnectId) {
    return NextResponse.json({ error: "stripe_not_connected" }, { status: 400 });
  }

  const stripe = getStripe();

  const prices = await stripe.prices.list(
    { active: true, type: "recurring", expand: ["data.product"], limit: 100 },
    { stripeAccount: tenant.stripeConnectId },
  );

  const options: StripePriceOption[] = [];

  for (const price of prices.data) {
    if (!price.unit_amount || price.currency !== "usd") continue;
    const product = price.product;
    if (!product || typeof product === "string" || product.deleted) continue;

    // Normalise to monthly amount
    let monthly = price.unit_amount / 100;
    if (price.recurring?.interval === "year") monthly = monthly / 12;
    if (price.recurring?.interval === "week") monthly = monthly * 4.33;

    options.push({
      priceId: price.id,
      productName: product.name,
      amount: Math.round(monthly * 100) / 100,
      interval: price.recurring?.interval ?? "month",
      currency: price.currency,
    });
  }

  // Sort cheapest first
  options.sort((a, b) => a.amount - b.amount);

  return NextResponse.json({ prices: options });
}
