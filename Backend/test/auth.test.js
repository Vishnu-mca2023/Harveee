const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../server"); // make sure your express app is exported

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Auth API Tests", () => {
  let userId;

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .field("name", "Test User")
      .field("email", "test@example.com")
      .field("password", "Test@123")
      .field("phone", "1234567890");

    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe("test@example.com");
    userId = res.body.user._id;
  });

  it("should not register same email twice", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .field("name", "Test User")
      .field("email", "test@example.com")
      .field("password", "Test@123")
      .field("phone", "1234567890");

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Email already exists!");
  });

  it("should login the registered user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "Test@123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.role).toBe("user");
  });

  it("should fail login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "wrongpass" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid password");
  });
});
