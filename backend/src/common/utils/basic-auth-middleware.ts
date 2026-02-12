import * as express from 'express';
import { Buffer } from 'buffer';
import { timingSafeEqual } from 'crypto';

export function basicAuthMiddleware(username: string, password: string) {
  const realm = 'Swagger Docs';
  const expected = Buffer.from(`${username}:${password}`);

  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Basic ')) {
      res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
      return res.status(401).send('Authentication required');
    }

    try {
      const encoded = header.slice('Basic '.length);
      const decoded = Buffer.from(encoded, 'base64').toString('utf8'); // "user:pass"
      const candidate = Buffer.from(decoded);

      // length check avoids throwing in timingSafeEqual
      if (candidate.length !== expected.length) {
        res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
        return res.status(401).send('Invalid credentials');
      }

      // constant-time compare
      if (!timingSafeEqual(candidate, expected)) {
        res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
        return res.status(401).send('Invalid credentials');
      }

      return next();
    } catch {
      res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
      return res.status(401).send('Invalid credentials');
    }
  };
}
