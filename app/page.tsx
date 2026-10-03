import { cookies } from "next/headers";
import { LoginForm } from "./login-form";
import { getSessionToken } from "./auth-config";
import { OperationsApp } from "./operations-app";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionToken = getSessionToken();
  const authenticated = Boolean(sessionToken) && cookieStore.get("operations_session")?.value === sessionToken;
  return authenticated ? <OperationsApp /> : <LoginForm />;
}
