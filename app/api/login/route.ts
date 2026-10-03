import { NextResponse } from "next/server";
import { getOperationsPassword, getSessionToken } from "../../auth-config";
export async function POST(request: Request) {
  const { password } = await request.json() as { password?: string };
  const operationsPassword = getOperationsPassword();
  const sessionToken = getSessionToken();
  if (!operationsPassword || !sessionToken || password !== operationsPassword) return NextResponse.json({ ok: false }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("operations_session", sessionToken, { httpOnly: true, secure: new URL(request.url).protocol === "https:", sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
  return response;
}
