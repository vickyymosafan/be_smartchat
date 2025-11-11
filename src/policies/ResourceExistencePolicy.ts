/**
 * Resource Existence Policy
 * Centralized validation for resource existence checks
 */

/**
 * Ensure resource exists or throw error
 */
export async function ensureResourceExists<T>(
  resource: T | null,
  resourceName: string,
  identifier?: string
): Promise<T> {
  if (!resource) {
    const idPart = identifier ? ` with id '${identifier}'` : '';
    throw new Error(`${resourceName}${idPart} not found`);
  }
  return resource;
}

/**
 * Check if resource exists (boolean check)
 */
export async function checkResourceExists(
  existsCheck: () => Promise<boolean>,
  resourceName: string,
  identifier: string
): Promise<void> {
  const exists = await existsCheck();
  if (!exists) {
    throw new Error(`${resourceName} with id '${identifier}' not found`);
  }
}
