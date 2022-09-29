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
  try {
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
  } catch (error) {
    if (error instanceof Error) {
      throw new functions.https.HttpsError("internal", error.message);
    }
    throw new functions.https.HttpsError("unknown", "Failed to create admin");
  }
});
