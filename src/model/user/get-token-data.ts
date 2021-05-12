import jwt from 'jsonwebtoken';

import { TokenData } from './token-data.interface';

export function getTokenData(): Partial<TokenData> {
  const tokenStr = localStorage.getItem('token');

  if (!tokenStr) return {};

  return jwt.decode(tokenStr) as Record<string, any> as TokenData;
}
