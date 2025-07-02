const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// atribuir claim admin
exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "Somente admins podem alterar claims.");
  }
  const uid = data.uid;
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  return { message: `Admin claim atribuída a ${uid}` };
});

// remover claim admin
exports.unsetAdminClaim = functions.https.onCall(async (data, context) => {
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "Somente admins podem alterar claims.");
  }
  const uid = data.uid;
  await admin.auth().setCustomUserClaims(uid, { admin: false });
  return { message: `Admin claim removida de ${uid}` };
});
