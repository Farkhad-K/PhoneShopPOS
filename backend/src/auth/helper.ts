export interface AccessPayload {
  sub: number;
  username: string;
  tokenVersion?: number;
  iat?: number;
  exp?: number;
}

export interface RefreshPayload {
  sub: number;
  username: string;
  tokenVersion?: number;
  iat?: number;
  exp?: number;
}

export function tokenVersionMatches(
  payloadVersion: number | undefined,
  userVersion: number | undefined,
): boolean {
  return (payloadVersion ?? 0) === (userVersion ?? 0);
}
