"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

/**
 * UserButton in an RSC layout: portal subtree differs after hydrate. Gate on mount.
 */
export function ClerkUserButton() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div style={{ width: 32, height: 32, minWidth: 32, minHeight: 32 }} aria-hidden />;
  }

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: { width: 32, height: 32 },
        },
      }}
    />
  );
}

/**
 * Clerk's UserButton uses a Portal; SSR output often differs from the first client render.
 * Render a stable placeholder until mounted so server and client markup match.
 */
export function ClerkAuthHeader() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div style={{ minWidth: 120, minHeight: 36 }} aria-hidden />;
  }

  return (
    <>
      <SignedOut>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
}
