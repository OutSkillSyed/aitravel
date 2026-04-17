'use client';

import { usePathname } from 'next/navigation';

const HIDE_CHROME_PREFIXES = ['/sign-in', '/sign-up'];

/**
 * Chrome wraps the page with site header/footer UNLESS we're on an auth route.
 *
 * Header/footer are passed as pre-rendered RSC nodes so this client wrapper
 * never has to import server-only code (e.g. `next/headers` in SiteHeader).
 */
export function Chrome({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const bare = HIDE_CHROME_PREFIXES.some((p) => pathname?.startsWith(p));

  if (bare) return <>{children}</>;

  return (
    <>
      {header}
      <main>{children}</main>
      {footer}
    </>
  );
}
