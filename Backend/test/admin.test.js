const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../server"); // import app from server.js

let mongoServer;
let adminToken;
let createdUserId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // create admin
  await request(app).post("/api/users").send({
    name: "Admin",
    email: "admin@test.com",
    password: "admin123",
    role: "admin",
  });

  // login admin
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@test.com", password: "admin123" });

  adminToken = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("ADMIN ROUTES (mounted at /api/users)", () => {

  test("POST /api/users → admin can create new user", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Test User", email: "user@test.com", password: "user123" });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe("user@test.com");
    createdUserId = res.body.user._id;
  });

  test("POST /api/users → should fail duplicate email", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Duplicate User", email: "user@test.com", password: "user123" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("PUT /api/users/:id → admin updates user", async () => {
    const res = await request(app)
      .put(`/api/users/${createdUserId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Updated User" });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.name).toBe("Updated User");
  });

  test("PUT /api/users/:id → invalid ID should return 404", async () => {
    const res = await request(app)
      .put("/api/users/64f5e6e123456789abcdef12")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Nothing" });

    expect(res.statusCode).toBe(404);
  });

  test("DELETE /api/users/:id → admin deletes user", async () => {
    const res = await request(app)
      .delete(`/api/users/${createdUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  test("DELETE /api/users/:id → invalid ID should return 404", async () => {
    const res = await request(app)
      .delete("/api/users/64f5e6e123456789abcdef12")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });

});
