const FIRST_ADMIN = { email: 'fiubatallergrupo7@gmail.com', encryptedPassword: '' }
const { v4: uuidv4 } = require('uuid');

module.exports = async (app) => {
  const adminUser = await app.auth().getUserByEmail(FIRST_ADMIN.email);
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