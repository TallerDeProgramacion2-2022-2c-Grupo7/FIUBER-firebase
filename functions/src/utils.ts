import { AuthData } from "firebase-functions/lib/common/providers/tasks";

export const isAdminUser = (auth?: AuthData) => {
  return auth && auth.token && auth.token.admin === true;
};
