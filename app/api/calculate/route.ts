import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionToken } from "../../auth-config";
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = getSessionToken();
  if (!sessionToken || cookieStore.get("operations_session")?.value !== sessionToken) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  const body = await request.json() as { staffHours?: number[]; travelMinutes?: number; kilometers?: number; otherCosts?: number };
  const staffHours = Array.isArray(body.staffHours) ? body.staffHours.map(safe) : [];
  const travelMinutes = safe(body.travelMinutes), kilometers = safe(body.kilometers), other = safe(body.otherCosts);
  const staff = cents(staffHours.reduce((sum, value) => sum + value, 0) * 90);
  const travelTime = cents((travelMinutes / 60) * 90), mileage = cents(kilometers * .6);
  const base = cents(staff + travelTime + mileage + other), total = Math.ceil(cents(base * 1.25) / 5) * 5;
  const profit = cents(total - base);
  return NextResponse.json({ staff, travelTime, mileage, travel: cents(travelTime + mileage), other: cents(other), profit, total, externalStaff: cents(staff + profit) });
}
function safe(value: unknown) { const number = Number(value); return Number.isFinite(number) && number >= 0 ? number : 0; }
function cents(value: number) { return Math.round(value * 100) / 100; }
