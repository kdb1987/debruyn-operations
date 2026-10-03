import "server-only";

export function getOperationsPassword() {
  return process.env.OPERATIONS_PASSWORD ?? "";
}

export function getSessionToken() {
  return process.env.OPERATIONS_SESSION_TOKEN ?? "";
}
