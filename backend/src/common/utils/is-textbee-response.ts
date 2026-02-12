export type TextBeeSendResponse = { id?: number; messageId?: string };

export function isTextBeeSendResponse(x: unknown): x is TextBeeSendResponse {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    o.id === undefined ||
    typeof o.id === 'string' ||
    o.messageId === undefined ||
    typeof o.messageId === 'string'
  );
}
