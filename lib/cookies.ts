import type { VercelResponse } from '@vercel/node';

export const setCookie = (
  res: VercelResponse,
  name: string,
  value: string,
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    maxAge?: number;
  } = {}
) => {
  const {
    httpOnly = true,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'strict',
    maxAge = 7 * 24 * 60 * 60, // 7 days in seconds
  } = options;

  const cookieOptions = [
    `${name}=${value}`,
    `Path=/`,
    `Max-Age=${maxAge}`,
    `SameSite=${sameSite}`,
    ...(httpOnly ? ['HttpOnly'] : []),
    ...(secure ? ['Secure'] : []),
  ].join('; ');

  res.setHeader('Set-Cookie', cookieOptions);
};

export const getCookie = (req: { headers: { cookie?: string } }, name: string): string | undefined => {
  const cookies = req.headers.cookie;
  if (!cookies) return undefined;

  const cookieMap = cookies.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookieMap[name];
};

export const clearCookie = (res: VercelResponse, name: string) => {
  res.setHeader(
    'Set-Cookie',
    `${name}=; Path=/; Max-Age=0; SameSite=strict; HttpOnly; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`
  );
};

