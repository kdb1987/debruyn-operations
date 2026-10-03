import { cookies } from "next/headers";
import { Calculator } from "./calculator";
import { LoginForm } from "./login-form";
import { getSessionToken } from "./auth-config";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionToken = getSessionToken();
  const authenticated = Boolean(sessionToken) && cookieStore.get("operations_session")?.value === sessionToken;
  return authenticated ? <Calculator /> : <LoginForm />;
}
