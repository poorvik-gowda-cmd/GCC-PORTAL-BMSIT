async function testRemoteMe(token) {
  const resp = await fetch("https://gcc-portal-api-production.gcc-portal.workers.dev/api/v1/auth/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  console.log("ME STATUS:", resp.status);
  const data = await resp.json();
  console.log("ME RESPONSE BODY:", JSON.stringify(data, null, 2));
}

const token = "567084b44eb3a9213ea6c00d96209a0c19eb40cfe25814b6ba3620f2305d510c";
await testRemoteMe(token);
