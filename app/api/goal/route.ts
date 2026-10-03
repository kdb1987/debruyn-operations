import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionToken } from "../../auth-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = getSessionToken();
    if (!sessionToken || cookieStore.get("operations_session")?.value !== sessionToken) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }
    const supabaseUrl = process.env.SUPABASE_URL;
    const operationsToken = process.env.OPERATIONS_GOAL_API_TOKEN;
    if (!supabaseUrl || !operationsToken) {
      throw new Error("Ziel-Cockpit ist nicht konfiguriert");
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/operations-goal`, {
      headers: { "x-operations-token": operationsToken },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Zielservice ${response.status}`);
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("Ziel-Cockpit:", error);
    return NextResponse.json({ error: "Zieldaten nicht verfügbar" }, { status: 503 });
  }
}
