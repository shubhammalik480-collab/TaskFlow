const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const request = require("supertest");
const app = require("../app");

describe("TaskFlow API Tests", () => {

  // Test 1: Root API
  test("GET / should return 200 OK", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "TaskFlow API is running successfully!"
    );
  });

  // Test 2: Health Check
  test("GET /api/health should return 200 OK", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Server is healthy");
  });

  // Test 3: Invalid Route
  test("GET /invalid should return 404", async () => {
    const response = await request(app).get("/invalid");

    expect(response.status).toBe(404);
  });

});
// Authentication API Tests

describe("Authentication API Tests", () => {

  // Test 4: Register without required fields
  test("POST /api/auth/register should return 400 when fields are missing", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({});

    expect(response.status).toBe(400);
  });

  // Test 5: Login without required fields
  test("POST /api/auth/login should return 400 when fields are missing", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({});

    expect(response.status).toBe(400);
  });

  // Test 6: Profile without authentication
  test("GET /api/auth/profile should return 401 without token", async () => {
    const response = await request(app)
      .get("/api/auth/profile");

    expect(response.status).toBe(401);
  });

});
// Board API Tests

describe("Board API Tests", () => {

  // Test 7: Create Board without authentication
  test("POST /api/boards should return 401 without token", async () => {
    const response = await request(app)
      .post("/api/boards")
      .send({
        title: "Test Board",
        description: "Testing board creation"
      });

    expect(response.status).toBe(401);
  });

  // Test 8: Get All Boards without authentication
  test("GET /api/boards should return 401 without token", async () => {
    const response = await request(app)
      .get("/api/boards");

    expect(response.status).toBe(401);
  });

  // Test 9: Get Single Board without authentication
  test("GET /api/boards/:boardId should return 401 without token", async () => {
    const response = await request(app)
      .get("/api/boards/123456789012345678901234");

    expect(response.status).toBe(401);
  });

});
// Task API Tests

describe("Task API Tests", () => {

  // Test 10: Create Task without authentication
  test("POST /api/tasks/:boardId should return 401 without token", async () => {
    const response = await request(app)
      .post("/api/tasks/123456789012345678901234")
      .send({
        title: "Test Task",
        description: "Testing task creation"
      });

    expect(response.status).toBe(401);
  });

  // Test 11: Get Tasks without authentication
  test("GET /api/tasks/:boardId should return 401 without token", async () => {
    const response = await request(app)
      .get("/api/tasks/123456789012345678901234");

    expect(response.status).toBe(401);
  });

  // Test 12: Update Task without authentication
  test("PUT /api/tasks/:boardId/:taskId should return 401 without token", async () => {
    const response = await request(app)
      .put("/api/tasks/123456789012345678901234/123456789012345678901234")
      .send({
        title: "Updated Task"
      });

    expect(response.status).toBe(401);
  });

  // Test 13: Delete Task without authentication
  test("DELETE /api/tasks/:boardId/:taskId should return 401 without token", async () => {
    const response = await request(app)
      .delete("/api/tasks/123456789012345678901234/123456789012345678901234");

    expect(response.status).toBe(401);
  });

});
// Column API Tests

describe("Column API Tests", () => {

  // Test 14: Create Column without authentication
  test("POST /api/columns/:boardId should return 401 without token", async () => {
    const response = await request(app)
      .post("/api/columns/123456789012345678901234")
      .send({
        title: "Testing Column"
      });

    expect(response.status).toBe(401);
  });

  // Test 15: Get Columns without authentication
  test("GET /api/columns/:boardId should return 401 without token", async () => {
    const response = await request(app)
      .get("/api/columns/123456789012345678901234");

    expect(response.status).toBe(401);
  });

  // Test 16: Update Column without authentication
  test("PUT /api/columns/:boardId/:columnId should return 401 without token", async () => {
    const response = await request(app)
      .put("/api/columns/123456789012345678901234/123456789012345678901234")
      .send({
        title: "Updated Column"
      });

    expect(response.status).toBe(401);
  });

  // Test 17: Delete Column without authentication
  test("DELETE /api/columns/:boardId/:columnId should return 401 without token", async () => {
    const response = await request(app)
      .delete("/api/columns/123456789012345678901234/123456789012345678901234");

    expect(response.status).toBe(401);
  });

});