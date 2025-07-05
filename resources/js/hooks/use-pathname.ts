// filepath: /Users/seanalaback/PhpstormProjects/OrgPilot/resources/js/hooks/use-pathname.ts
import { usePage } from '@inertiajs/react';

export function usePathname() {
  const { url } = usePage();
  return url;
}
