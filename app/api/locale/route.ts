import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.formData();
  const locale = body.get('locale') === 'pt' ? 'pt' : 'en';
  const referer = req.headers.get('referer') || '/';
  const res = NextResponse.redirect(referer, 303);
  res.cookies.set('locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  return res;
}
