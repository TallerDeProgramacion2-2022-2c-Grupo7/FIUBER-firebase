const FIRST_ADMIN = { email: 'fiubatallergrupo7@gmail.com', encryptedPassword: process.env.ADMIN_PASSWORD_HASH }
const { v4: uuidv4 } = require('uuid');

module.exports = async (app) => {
  console.log(FIRST_ADMIN)
  const adminUser = await app.auth().getUserByEmail(FIRST_ADMIN.email).catch(() => undefined);
  const uuid = adminUser ? adminUser.uid : uuidv4();
  if (!adminUser) {
    await app.auth().importUsers(
      [
        {
          uid: uuid,
          email: FIRST_ADMIN.email,
          passwordHash: Buffer.from(FIRST_ADMIN.encryptedPassword),
        },
      ],
      {
        hash: {
          algorithm: 'BCRYPT',
        },
      }
    )
  }


  await app.auth().setCustomUserClaims(uuid, { admin: true });
};