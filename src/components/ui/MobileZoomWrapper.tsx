import React from "react";

/**
 * Used to shrink desktop layouts on phones (scaled to 40-80%), which made text unreadable.
 * The pages are responsive, so on phones they now render at normal size in their mobile layout.
 * Kept as a pass-through so existing pages need no change.
 */
export function MobileZoomWrapper({ children }: { children: React.ReactNode; scaleMobile?: number }) {
  return <>{children}</>;
}
