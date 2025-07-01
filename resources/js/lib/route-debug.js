import { router } from '@inertiajs/react';

/**
 * Debug function to check if routes are registered properly
 */
export function debugRoute(route, params = {}) {
  try {
    console.log(`Trying to resolve route: ${route}`);
    console.log(`With params:`, params);
    const url = route(route, params);
    console.log(`Resolved URL: ${url}`);
    return url;
  } catch (error) {
    console.error(`Error resolving route ${route}:`, error);
    return null;
  }
}

/**
 * Visit a route with debugging
 */
export function visitRoute(route, params = {}) {
  try {
    const url = debugRoute(route, params);
    if (url) {
      router.visit(url);
    }
  } catch (error) {
    console.error(`Error visiting route ${route}:`, error);
    // Fall back to direct URL if route() fails
    const urlPath = `/organisation/profile/${params.orgNode}/one-on-one`;
    console.log(`Falling back to direct URL: ${urlPath}`);
    router.visit(urlPath);
  }
}
