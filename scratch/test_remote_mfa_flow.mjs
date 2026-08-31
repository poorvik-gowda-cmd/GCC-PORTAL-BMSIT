async function testMfaFlow() {
  console.log("--- STEP 1: POST /login ---");
  const loginResp = await fetch("https://gcc-portal-api-production.gcc-portal.workers.dev/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "superadmin@bmsit.in",
      password: "Gcc@BMSIT@2026",
    }),
  });

  console.log("LOGIN STATUS:", loginResp.status);
  const loginData = await loginResp.json();
  console.log("LOGIN DATA:", JSON.stringify(loginData, null, 2));

  if (!loginData.data?.mfaSessionToken) {
    console.error("MFA session token missing!");
    return;
  }

  const mfaToken = loginData.data.mfaSessionToken;

  console.log("\n--- STEP 2: POST /mfa/verify (using Recovery Code RECOVERY-004) ---");
  const verifyResp = await fetch("https://gcc-portal-api-production.gcc-portal.workers.dev/api/v1/auth/mfa/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mfaSessionToken: mfaToken,
      recoveryCode: "RECOVERY-004",
    }),
  });

  console.log("VERIFY STATUS:", verifyResp.status);
  const verifyData = await verifyResp.json();
  console.log("VERIFY DATA:", JSON.stringify(verifyData, null, 2));

  if (!verifyData.data?.sessionToken) {
    console.error("Session token missing!");
    return;
  }

  const sessionToken = verifyData.data.sessionToken;

  console.log("\n--- STEP 3: GET /auth/me ---");
  const meResp = await fetch("https://gcc-portal-api-production.gcc-portal.workers.dev/api/v1/auth/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${sessionToken}`,
    },
  });

  console.log("ME STATUS:", meResp.status);
  const meData = await meResp.json();
  console.log("ME DATA:", JSON.stringify(meData, null, 2));
}

await testMfaFlow();
