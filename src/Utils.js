import { jwtDecode } from "jwt-decode";
// convert string to title case
export const tc = (str) =>
  str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );

export function getUser(encoded) {
  // return unencoded user / permissions
  const decoded = jwtDecode(encoded);
  const roleClaims =
    decoded.roles ??
    decoded.role ??
    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  const roles = Array.isArray(roleClaims)
    ? roleClaims
    : roleClaims
      ? [roleClaims]
      : [];

  return {
    name:
      decoded.username ??
      decoded.unique_name ??
      decoded.name ??
      decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ??
      null,
    authenticated: true,
    canPost: roles.includes("medals-post"),
    canPatch: roles.includes("medals-patch"),
    canDelete: roles.includes("medals-delete"),
  };
}
