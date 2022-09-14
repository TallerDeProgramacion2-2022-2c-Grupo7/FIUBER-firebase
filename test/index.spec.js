const { readFileSync, createWriteStream } = require('fs');
const http = require("http");
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc, serverTimestamp, setLogLevel, updateDoc, deleteDoc } = require('firebase/firestore');

/** @type testing.RulesTestEnvironment */
let testEnv;

before(async () => {
  // Silence expected rules rejections from Firestore SDK. Unexpected rejections
  // will still bubble up and will be thrown as an error (failing the tests).
  setLogLevel('error');

  testEnv = await initializeTestEnvironment({
    hub: {
      host: '127.0.0.1',
      port: "4400"
    },
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: '8080' },
  });
});

after(async () => {
  // Delete all the FirebaseApp instances created during testing.
  // Note: this does not affect or clear any data.
  await testEnv.cleanup();

  // Write the coverage report to a file
  const coverageFile = 'firestore-coverage.html';
  const fstream = createWriteStream(coverageFile);
  await new Promise((resolve, reject) => {
    const { host, port } = testEnv.emulators.firestore;
    const quotedHost = host.includes(':') ? `[${host}]` : host;
    http.get(`http://${quotedHost}:${port}/emulator/v1/projects/${testEnv.projectId}:ruleCoverage.html`, (res) => {
      res.pipe(fstream, { end: true });

      res.on("end", resolve);
      res.on("error", reject);
    });
  });

  console.log(`View firestore rule coverage information at ${coverageFile}\n`);
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("Public Profiles", async () => {
  describe("Public Profiles Are Only Created By Owners", async () => {
    it("Public Profiles Created By Owner", async () => {
      const userId = 'alice'
      const authContext = testEnv.authenticatedContext(userId)

      await assertSucceeds(setDoc(doc(authContext.firestore(), `publicProfiles/${userId}`), { foo: 'bar' }));
    })
    it("Public Profiles Created By Other", async () => {
      const userId = 'alice'
      const otherUserId = 'jhon'
      const authContext = testEnv.authenticatedContext(userId)

      await assertFails(setDoc(doc(authContext.firestore(), `publicProfiles/${otherUserId}`), { foo: 'bar' }));
    })
    it("Public Profiles Created By Not Auth", async () => {
      const userId = 'alice'
      const unauthContext = testEnv.unauthenticatedContext()

      await assertFails(setDoc(doc(unauthContext.firestore(), `publicProfiles/${userId}`), { foo: 'bar' }));
    })
  })
  describe("Public Profiles Are Only Updated By Owners", async () => {
    beforeEach(async () => {
      const userId = 'alice'
      const authContext = testEnv.authenticatedContext(userId)

      await setDoc(doc(authContext.firestore(), `publicProfiles/${userId}`), { foo: 'bar' });
    })
    it("Public Profiles Update By Owner", async () => {
      const userId = 'alice'
      const authContext = testEnv.authenticatedContext(userId)

      await assertSucceeds(updateDoc(doc(authContext.firestore(), `publicProfiles/${userId}`), { foo2: 'bar2' }));
    })
    it("Public Profiles Updated By Other", async () => {
      const userId = 'alice'
      const otherUserId = 'jhon'
      const authContext = testEnv.authenticatedContext(otherUserId)

      await assertFails(updateDoc(doc(authContext.firestore(), `publicProfiles/${userId}`), { foo2: 'bar2' }));
    })
    it("Public Profiles Updated By Not Auth", async () => {
      const userId = 'alice'
      const unauthContext = testEnv.unauthenticatedContext()

      await assertFails(updateDoc(doc(unauthContext.firestore(), `publicProfiles/${userId}`), { foo2: 'bar2' }));
    })
  })
  describe("Public Profiles Are Only Deleted By Owners", async () => {
    beforeEach(async () => {
      const userId = 'alice'
      const authContext = testEnv.authenticatedContext(userId)

      await setDoc(doc(authContext.firestore(), `publicProfiles/${userId}`), { foo: 'bar' });
    })
    it("Public Profiles Deleted By Owner", async () => {
      const userId = 'alice'
      const authContext = testEnv.authenticatedContext(userId)

      await assertSucceeds(deleteDoc(doc(authContext.firestore(), `publicProfiles/${userId}`)));
    })
    it("Public Profiles Deleted By Other", async () => {
      const userId = 'alice'
      const otherUserId = 'jhon'
      const authContext = testEnv.authenticatedContext(otherUserId)

      await assertFails(deleteDoc(doc(authContext.firestore(), `publicProfiles/${userId}`)));
    })
    it("Public Profiles Deleted By Not Auth", async () => {
      const userId = 'alice'
      const unauthContext = testEnv.unauthenticatedContext()

      await assertFails(deleteDoc(doc(unauthContext.firestore(), `publicProfiles/${userId}`)));
    })
  })
  describe("Public Profiles Are Get By Any Auth User", async () => {
    beforeEach(async () => {
      const userId = 'alice'
      const authContext = testEnv.authenticatedContext(userId)

      await setDoc(doc(authContext.firestore(), `publicProfiles/${userId}`), { foo: 'bar' });
    })
    it("Public Profiles Getted By Owner", async () => {
      const userId = 'alice'
      const authContext = testEnv.authenticatedContext(userId)

      await assertSucceeds(getDoc(doc(authContext.firestore(), `publicProfiles/${userId}`)));
    })
    it("Public Profiles Getted By Other", async () => {
      const userId = 'alice'
      const otherUserId = 'jhon'
      const authContext = testEnv.authenticatedContext(otherUserId)

      await assertSucceeds(getDoc(doc(authContext.firestore(), `publicProfiles/${userId}`)));
    })
    it("Public Profiles Getted By Not Auth", async () => {
      const userId = 'alice'
      const unauthContext = testEnv.unauthenticatedContext()

      await assertFails(getDoc(doc(unauthContext.firestore(), `publicProfiles/${userId}`)));
    })
  })
})

describe("Private Profiles", async () => {
  describe("Private Profiles Are Only Created By Owners", async () => {
    it("Private Profiles Created By Owner", async () => {
      const userId = 'alice'
      const authContext = testEnv.authenticatedContext(userId)

      await assertSucceeds(setDoc(doc(authContext.firestore(), `privateProfiles/${userId}`), { foo: 'bar' }));
    })
    it("Private Profiles Created By Other", async () => {
      const userId = 'alice'
      const otherUserId = 'jhon'
      const authContext = testEnv.authenticatedContext(userId)

      await assertFails(setDoc(doc(authContext.firestore(), `privateProfiles/${otherUserId}`), { foo: 'bar' }));
    })
    it("Private Profiles Created By Not Auth", async () => {
      const userId = 'alice'
      const unauthContext = testEnv.unauthenticatedContext()

      await assertFails(setDoc(doc(unauthContext.firestore(), `privateProfiles/${userId}`), { foo: 'bar' }));
    })
  })
  describe("Private Profiles Are Only Updated By Owners", async () => {
    beforeEach(async () => {
      const userId = 'alice'
      const authContext = testEnv.authenticatedContext(userId)

      await setDoc(doc(authContext.firestore(), `privateProfiles/${userId}`), { foo: 'bar' });
    })
    it("Private Profiles Update By Owner", async () => {
      const userId = 'alice'
      const authContext = testEnv.authenticatedContext(userId)

      await assertSucceeds(updateDoc(doc(authContext.firestore(), `privateProfiles/${userId}`), { foo2: 'bar2' }));
    })
    it("Private Profiles Updated By Other", async () => {
      const userId = 'alice'
      const otherUserId = 'jhon'
      const authContext = testEnv.authenticatedContext(otherUserId)

      await assertFails(updateDoc(doc(authContext.firestore(), `privateProfiles/${userId}`), { foo2: 'bar2' }));
    })
    it("Private Profiles Updated By Not Auth", async () => {
      const userId = 'alice'
      const unauthContext = testEnv.unauthenticatedContext()

      await assertFails(updateDoc(doc(unauthContext.firestore(), `privateProfiles/${userId}`), { foo2: 'bar2' }));
    })
  })
  describe("Private Profiles Are Only Deleted By Owners", async () => {
    beforeEach(async () => {
      const userId = 'alice'
      const authContext = testEnv.authenticatedContext(userId)

      await setDoc(doc(authContext.firestore(), `privateProfiles/${userId}`), { foo: 'bar' });
    })
    it("Private Profiles Deleted By Owner", async () => {
      const userId = 'alice'
      const authContext = testEnv.authenticatedContext(userId)

      await assertSucceeds(deleteDoc(doc(authContext.firestore(), `privateProfiles/${userId}`)));
    })
    it("Private Profiles Deleted By Other", async () => {
      const userId = 'alice'
      const otherUserId = 'jhon'
      const authContext = testEnv.authenticatedContext(otherUserId)

      await assertFails(deleteDoc(doc(authContext.firestore(), `privateProfiles/${userId}`)));
    })
    it("Private Profiles Deleted By Not Auth", async () => {
      const userId = 'alice'
      const unauthContext = testEnv.unauthenticatedContext()

      await assertFails(deleteDoc(doc(unauthContext.firestore(), `privateProfiles/${userId}`)));
    })
  })
  describe("Private Profiles Are Get By Any Auth User", async () => {
    beforeEach(async () => {
      const userId = 'alice'
      const authContext = testEnv.authenticatedContext(userId)

      await setDoc(doc(authContext.firestore(), `privateProfiles/${userId}`), { foo: 'bar' });
    })
    it("Private Profiles Getted By Owner", async () => {
      const userId = 'alice'
      const authContext = testEnv.authenticatedContext(userId)

      await assertSucceeds(getDoc(doc(authContext.firestore(), `privateProfiles/${userId}`)));
    })
    it("Private Profiles Getted By Other", async () => {
      const userId = 'alice'
      const otherUserId = 'jhon'
      const authContext = testEnv.authenticatedContext(otherUserId)

      await assertFails(getDoc(doc(authContext.firestore(), `privateProfiles/${userId}`)));
    })
    it("Private Profiles Getted By Not Auth", async () => {
      const userId = 'alice'
      const unauthContext = testEnv.unauthenticatedContext()

      await assertFails(getDoc(doc(unauthContext.firestore(), `privateProfiles/${userId}`)));
    })
  })
})
