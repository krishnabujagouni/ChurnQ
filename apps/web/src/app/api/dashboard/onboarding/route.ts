import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateEmbedAppId, generateEmbedHmacSecret } from "@/lib/tenant-embed";

function generateSnippetKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "cs_live_";
  for (let i = 0; i < 24; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productName, productUrl, mrrRange, subscriberCount } = await req.json();

  if (!productName || !productUrl || !mrrRange || !subscriberCount) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  // Upsert so this works even if the Clerk webhook hasn't fired yet
  await prisma.tenant.upsert({
    where: { clerkUserId: userId },
    update: {
      onboarded: true,
      onboardingData: { productName, productUrl, mrrRange, subscriberCount },
    },
    create: {
      clerkUserId: userId,
      name: productName,
      onboarded: true,
      onboardingData: { productName, productUrl, mrrRange, subscriberCount },
      snippetKey: generateSnippetKey(),
      embedAppId: generateEmbedAppId(),
      embedHmacSecret: generateEmbedHmacSecret(),
    },
  });

  return NextResponse.json({ ok: true });
}
