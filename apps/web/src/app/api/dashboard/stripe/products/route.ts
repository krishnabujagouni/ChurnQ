import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe-server";

export type StripeProductOption = {
  productId: string;
  name: string;
  description: string | null;
  priceCount: number;
  lowestMonthly: number;
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

  const productMap = new Map<string, StripeProductOption>();

  for (const price of prices.data) {
    const product = price.product;
    if (!product || typeof product === "string" || product.deleted) continue;
    if (!price.unit_amount) continue;

    let monthly = price.unit_amount / 100;
    if (price.recurring?.interval === "year") monthly = monthly / 12;
    if (price.recurring?.interval === "week") monthly = monthly * 4.33;
    monthly = Math.round(monthly * 100) / 100;

    const existing = productMap.get(product.id);
    if (existing) {
      existing.priceCount += 1;
      if (monthly < existing.lowestMonthly) existing.lowestMonthly = monthly;
    } else {
      productMap.set(product.id, {
        productId: product.id,
        name: product.name,
        description: product.description,
        priceCount: 1,
        lowestMonthly: monthly,
      });
    }
  }

  const products = Array.from(productMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Also return which product IDs are currently active for this tenant
  const settings = (tenant.offerSettings ?? {}) as Record<string, unknown>;
  const activeProductIds: string[] = Array.isArray(settings.activeProductIds)
    ? (settings.activeProductIds as string[])
    : [];

  return NextResponse.json({ products, activeProductIds });
}

export async function POST(req: Request) {
  const { userId, orgId } = auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { activeProductIds } = await req.json() as { activeProductIds: string[] };
  if (!Array.isArray(activeProductIds)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const where = orgId ? { clerkOrgId: orgId } : { clerkUserId: userId };
  const tenant = await prisma.tenant.findUnique({ where });
  if (!tenant) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const existing = (tenant.offerSettings ?? {}) as Record<string, unknown>;
  await prisma.tenant.update({
    where,
    data: {
      offerSettings: {
        ...existing,
        activeProductIds: activeProductIds.filter((id) => typeof id === "string" && id.startsWith("prod_")),
      },
    },
  });

  return NextResponse.json({ ok: true });
}
