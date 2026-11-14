/** Logo of a website served by our own /api/logo endpoint (cached on the CDN). */
export const logoUrl = (domain: string, size: 32 | 64 | 128 = 128) =>
  `/api/logo?domain=${encodeURIComponent(domain.replace(/^https?:\/\//, "").replace(/\/.*$/, ""))}&sz=${size}`;
