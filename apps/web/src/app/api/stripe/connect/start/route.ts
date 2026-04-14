import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signConnectState } from "@/lib/connect-state";

/** Starts Stripe Connect Standard OAuth for the authenticated merchant. */
export async function GET(request: Request) {
  const { userId, orgId } = auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const tenant = orgId
    ? await prisma.tenant.findUnique({ where: { clerkOrgId: orgId } })
    : await prisma.tenant.findUnique({ where: { clerkUserId: userId } });

  if (!tenant) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const clientId = process.env.STRIPE_CLIENT_ID;
  const redirectUri = process.env.STRIPE_CONNECT_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    const u = new URL("/dashboard/settings", request.url);
    u.searchParams.set("error", "stripe_connect_not_configured");
    return NextResponse.redirect(u);
  }

  const isPopup = new URL(request.url).searchParams.get("popup") === "1";
  const state = signConnectState(tenant.id);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: "read_write",
    redirect_uri: redirectUri,
    state,
  });
  if (tenant.stripeConnectId) {
    params.set("stripe_landing", "login");
  }

  const authorize = new URL("https://connect.stripe.com/oauth/authorize");
  authorize.search = params.toString();

  const res = NextResponse.redirect(authorize);

  // Store popup flag in a short-lived cookie so the callback knows where to redirect
  if (isPopup) {
    res.cookies.set("stripe_connect_popup", "1", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });
  } else {
    res.cookies.delete("stripe_connect_popup");
  }

  return res;
}
