import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { isAdminUser } from "./utils";

export const createAdmin = functions.https.onCall(async (data, context) => {
  if (!isAdminUser(context.auth)) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You are not allowed to create an admin user"
    );
  }
  const newAdmin = await admin.auth().createUser({
    email: data.email,
    password: data.password,
  });

  if (!newAdmin) {
    throw new functions.https.HttpsError(
      "internal",
      "Failed to create admin user"
    );
  }
  await admin.auth().setCustomUserClaims(newAdmin.uid, { admin: true });
  return newAdmin;
});
