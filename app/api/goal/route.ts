import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionToken } from "../../auth-config";

export const dynamic = "force-dynamic";

type GoalSnapshot = {
  metric_code: string;
  metric_name: string;
  current_value: number | string;
  minimum_value: number | string;
  positive_value: number | string;
  dream_value: number | string;
  month_start: string;
  source_updated_at: string | null;
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = getSessionToken();
    if (!sessionToken || cookieStore.get("operations_session")?.value !== sessionToken) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }
    const supabaseUrl = process.env.SUPABASE_URL || "https://hgqrushcvdkzdpfdywzv.supabase.co";
    const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error("Ziel-Cockpit ist nicht konfiguriert");
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/operations_goal_snapshot?select=metric_code,metric_name,current_value,minimum_value,positive_value,dream_value,month_start,source_updated_at&id=eq.current&limit=1`,
      {
      headers: { apikey: publishableKey },
      cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Zieldatenbank ${response.status}`);
    }

    const snapshots = (await response.json()) as GoalSnapshot[];
    const snapshot = snapshots[0];
    if (!snapshot) return NextResponse.json(null);

    const monthDate = new Date(`${snapshot.month_start}T12:00:00Z`);
    return NextResponse.json({
      metricCode: snapshot.metric_code,
      metricName: snapshot.metric_name,
      current: Number(snapshot.current_value) || 0,
      minimum: Number(snapshot.minimum_value) || 0,
      positive: Number(snapshot.positive_value) || 0,
      dream: Number(snapshot.dream_value) || 0,
      monthLabel: new Intl.DateTimeFormat("de-DE", {
        month: "long",
        year: "numeric",
        timeZone: "Europe/Berlin",
      }).format(monthDate),
      updatedAt: snapshot.source_updated_at,
    });
  } catch (error) {
    console.error("Ziel-Cockpit:", error);
    return NextResponse.json({ error: "Zieldaten nicht verfügbar" }, { status: 503 });
  }
}
