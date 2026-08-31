async function testRemoteLogin() {
  const resp = await fetch("https://gcc-portal-api-production.gcc-portal.workers.dev/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "superadmin@bmsit.in",
      password: "Gcc@BMSIT@2026",
    }),
  });

  console.log("LOGIN STATUS:", resp.status);
  const data = await resp.json();
  console.log("LOGIN RESPONSE BODY:", JSON.stringify(data, null, 2));
}

await testRemoteLogin();
