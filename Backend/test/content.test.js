// // test/content.test.js
// const request = require("supertest");
// const mongoose = require("mongoose");
// const { MongoMemoryServer } = require("mongodb-memory-server");
// const app = require("../server");
// const User = require("../models/User");
// const Content = require("../models/Content");

// let mongoServer;
// let userToken;
// let adminToken;
// let userId;
// let adminId;
// let contentId;

// beforeAll(async () => {
//   mongoServer = await MongoMemoryServer.create();
//   const uri = mongoServer.getUri();
//   await mongoose.connect(uri);

//   // Create a normal user
//   const userRes = await request(app)
//     .post("/api/auth/register")
//     .field("name", "Test User")
//     .field("email", "user@example.com")
//     .field("password", "Test@123")
//     .field("phone", "1234567890");
//   userId = userRes.body.user._id;
//   const loginUser = await request(app)
//     .post("/api/auth/login")
//     .send({ email: "user@example.com", password: "Test@123" });
//   userToken = loginUser.body.token;

//   // Create an admin user
//   const adminRes = await request(app)
//     .post("/api/auth/register")
//     .field("name", "Admin User")
//     .field("email", "admin@example.com")
//     .field("password", "Admin@123")
//     .field("phone", "9876543210");
//   adminId = adminRes.body.user._id;

//   // Update role to admin directly
//   await User.findByIdAndUpdate(adminId, { role: "admin" });
//   const loginAdmin = await request(app)
//     .post("/api/auth/login")
//     .send({ email: "admin@example.com", password: "Admin@123" });
//   adminToken = loginAdmin.body.token;
// });

// afterAll(async () => {
//   await mongoose.disconnect();
//   await mongoServer.stop();
// });

// describe("Content API Tests", () => {
//   it("should create new content as user", async () => {
//     const res = await request(app)
//       .post("/api/content")
//       .set("Authorization", `Bearer ${userToken}`)
//       .field("title", "Test Content")
//       .field("description", "This is a test content.");

//     expect(res.statusCode).toBe(201);
//     expect(res.body.content.title).toBe("Test Content");
//     contentId = res.body.content._id;
//   });

//   it("should fetch user content", async () => {
//     const res = await request(app)
//       .get("/api/content")
//       .set("Authorization", `Bearer ${userToken}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body.contents.length).toBe(1);
//     expect(res.body.contents[0]._id).toBe(contentId);
//   });

//   it("should update content as owner", async () => {
//     const res = await request(app)
//       .put(`/api/content/${contentId}`)
//       .set("Authorization", `Bearer ${userToken}`)
//       .send({ title: "Updated Title" });

//     expect(res.statusCode).toBe(200);
//     expect(res.body.content.title).toBe("Updated Title");
//   });

//   it("should NOT update content as non-owner", async () => {
//     const res = await request(app)
//       .put(`/api/content/${contentId}`)
//       .set("Authorization", `Bearer ${adminToken}`)
//       .send({ title: "Hack Attempt" });

//     // Admin can update all content, so this will succeed
//     expect(res.statusCode).toBe(200);
//   });

//   it("should delete content as admin", async () => {
//     const res = await request(app)
//       .delete(`/api/content/${contentId}`)
//       .set("Authorization", `Bearer ${adminToken}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body.message).toBe("Content deleted successfully");
//   });

//   it("should return empty array after deletion", async () => {
//     const res = await request(app)
//       .get("/api/content")
//       .set("Authorization", `Bearer ${userToken}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body.contents.length).toBe(0);
//   });
// });
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../server"); // import app

let mongoServer;
let userToken;
let contentId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // create a normal user
  await request(app).post("/api/users").send({
    name: "User",
    email: "user@test.com",
    password: "user123",
  });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "user@test.com", password: "user123" });

  userToken = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Content API Tests", () => {

  test("should create new content as user", async () => {
    const res = await request(app)
      .post("/api/content")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Test Content", description: "This is test content." });

    expect(res.statusCode).toBe(201);
    expect(res.body.content.title).toBe("Test Content");
    contentId = res.body.content._id;
  });

  test("should fetch user content", async () => {
    const res = await request(app)
      .get("/api/content")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]._id).toBe(contentId);
  });

  test("should update content as owner", async () => {
    const res = await request(app)
      .put(`/api/content/${contentId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Updated Content" });

    expect(res.statusCode).toBe(200);
    expect(res.body.content.title).toBe("Updated Content");
  });

  test("should NOT update content as non-owner", async () => {
    await request(app).post("/api/users").send({
      name: "Other",
      email: "other@test.com",
      password: "other123",
    });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "other@test.com", password: "other123" });

    const otherToken = loginRes.body.token;

    const res = await request(app)
      .put(`/api/content/${contentId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ title: "Hack Content" });

    expect(res.statusCode).toBe(403);
  });

  test("should delete content as admin", async () => {
    // create admin
    await request(app).post("/api/users").send({
      name: "Admin",
      email: "admin@test.com",
      password: "admin123",
      role: "admin",
    });

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "admin123" });

    const adminToken = adminLogin.body.token;

    const res = await request(app)
      .delete(`/api/content/${contentId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });

  test("should return empty array after deletion", async () => {
    const res = await request(app)
      .get("/api/content")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });

});
