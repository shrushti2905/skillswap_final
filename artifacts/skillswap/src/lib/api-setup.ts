import { setAuthTokenGetter } from "@workspace/api-client-react";
import { getAuthToken } from "./auth-token";

export function setupApi() {
  setAuthTokenGetter(getAuthToken);
}
