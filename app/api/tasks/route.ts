import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionToken } from "../../auth-config";

export const dynamic = "force-dynamic";

async function isAuthenticated() {
  const cookieStore = await cookies();
  const sessionToken = getSessionToken();
  return Boolean(sessionToken) && cookieStore.get("operations_session")?.value === sessionToken;
}

function config() {
  const supabaseUrl = process.env.SUPABASE_URL || "https://hgqrushcvdkzdpfdywzv.supabase.co";
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const apiToken = process.env.OPERATIONS_GOAL_API_TOKEN;
  const recipientKey = process.env.OPERATIONS_USER_KEY || "melanie-franke";
  if (!publishableKey || !apiToken) throw new Error("Aufgaben-Cockpit ist nicht konfiguriert");
  return { supabaseUrl, publishableKey, apiToken, recipientKey };
}

async function rpc(functionName: string, body: Record<string, unknown>) {
  const { supabaseUrl, publishableKey } = config();
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Aufgaben-Datenbank ${response.status}: ${detail}`);
  }
  return response.json();
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  try {
    const { apiToken, recipientKey } = config();
    const tasks = await rpc("operations_tasks_for_recipient", {
      p_recipient_key: recipientKey,
      p_token: apiToken,
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Aufgaben-Cockpit:", error);
    return NextResponse.json({ error: "Aufgaben nicht verfügbar" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const action = String(payload.action || "");
    const taskId = String(payload.taskId || "");
    const comment = String(payload.comment || "");
    if (!taskId || !["comment", "complete", "reopen"].includes(action)) {
      return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
    }

    const { apiToken, recipientKey } = config();
    await rpc("operations_task_action", {
      p_task_id: taskId,
      p_recipient_key: recipientKey,
      p_action: action,
      p_comment: comment,
      p_token: apiToken,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Aufgaben-Aktion:", error);
    return NextResponse.json({ error: "Aktion konnte nicht gespeichert werden" }, { status: 503 });
  }
}
