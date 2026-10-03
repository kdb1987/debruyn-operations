import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionToken } from "../../auth-config";

export const dynamic = "force-dynamic";

type GoalRow = { metric_code: string; metric_name: string; target_value: number; updated_at?: string };
type MetricRow = { treatments: number | string | null };

async function supabaseSelect<T>(path: string): Promise<T[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase ist nicht konfiguriert");
  const response = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" });
  if (!response.ok) throw new Error(`Supabase ${response.status}`);
  return response.json() as Promise<T[]>;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = getSessionToken();
    if (!sessionToken || cookieStore.get("operations_session")?.value !== sessionToken) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }
    const goals = await supabaseSelect<GoalRow>("performance_goals?select=metric_code,metric_name,target_value,updated_at&active=eq.true&order=metric_name.asc&limit=1");
    const goal = goals[0];
    if (!goal) return NextResponse.json(null);
    const now = new Date();
    const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
    const code = encodeURIComponent(goal.metric_code);
    const metrics = await supabaseSelect<MetricRow>(`employee_service_metrics?select=treatments&service_code=eq.${code}&month=eq.${month}`);
    const current = metrics.reduce((sum, row) => sum + (Number(row.treatments) || 0), 0);
    const positive = Number(goal.target_value || 0);
    return NextResponse.json({
      metricCode: goal.metric_code,
      metricName: goal.metric_name,
      current,
      minimum: Math.round(positive * 0.75),
      positive,
      dream: Math.round(positive * 1.2),
      monthLabel: new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(now),
      updatedAt: goal.updated_at,
    });
  } catch (error) {
    console.error("Ziel-Cockpit:", error);
    return NextResponse.json({ error: "Zieldaten nicht verfügbar" }, { status: 503 });
  }
}
