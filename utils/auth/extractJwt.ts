export const extractJwt = (header: string | null): string | null => {
  if (!header || !header.includes("Bearer")) {
    return null;
  }
  return header.split("Bearer ")[1];
};
