require("dotenv").config();
const request = require("supertest");
const app = require("../../../app");
const { testLoginUser } = require("../../helpers");
const {
  createUser,
  createPost,
  addUpvoteToPost,
  removeUpvoteFromPost,
} = require("../../../db");

describe("api/post_upvotes", () => {
  let user = {};
  let validUser = {};
  let post = {};
  let post2 = {};
  let post3 = {};
  let upvote1 = {};
  let upvote2 = {};
  let upvote3 = {};
  let token = "";

  const seedTestData = async () => {
    user = await createUser({
      firstname: "PU API Tests",
      lastname: "PU API Testerson",
      username: "TestPerson62",
      password: "supersecret12345",
      email: "PU.API.123.User@gmail.com",
    });
    validUser = await createUser({
      firstname: "PU API Tests2",
      lastname: "PU API Testerson2",
      username: "Test_McGee333",
      password: "supersecret1234",
      email: "PU.API.123.User2@gmail.com",
    });
    post = await createPost({
      userId: user.id,
      text: "Posting time!",
      time: new Date(),
      isPublic: true,
    });
    post2 = await createPost({
      userId: user.id,
      text: "Posting Time, Somewhere",
      time: new Date(),
      isPublic: true,
    });
    post3 = await createPost({
      userId: validUser.id,
      text: "Posting Time Now!",
      time: new Date(),
      isPublic: true,
    });
    upvote1 = await addUpvoteToPost({
      postId: post.id,
      userId: user.id,
    });
    upvote2 = await addUpvoteToPost({
      postId: post2.id,
      userId: user.id,
    });
    upvote3 = await addUpvoteToPost({
      postId: post3.id,
      userId: user.id,
    });
    const response = await testLoginUser({
      username: user.username,
      password: "supersecret12345",
    });
    token = await response.token;
  };

  describe("GET /api/post_upvotes/:postId", () => {
    it("Returns an object containing all relevant information", async () => {
      await seedTestData();

      console.log(user.id);

      const response = await request(app)
        .get(`/api/post_upvotes/${post.id}`)
        .set("Authorization", `Bearer ${token}`);

      await expect(response.body).toMatchObject({
        userHasUpvoted: expect.any(Boolean),
        upvotes: expect.any(Number),
        upvoterIds: expect.any(Array),
        success: expect.any(String),
      });
    });

    it("Returns a specific error when no comment is found by the provided ID", async () => {
      const response = await request(app).get(`/api/post_upvotes/0`);

      await expect(response.body).toMatchObject({
        error: expect.any(String),
        message: expect.any(String),
      });
    });

    it("Returns true if current user has already upvoted", async () => {
      const response = await request(app)
        .get(`/api/post_upvotes/${post.id}`)
        .set("Authorization", `Bearer ${token}`);

      await expect(response.body).toMatchObject({
        userHasUpvoted: true,
        upvotes: expect.any(Number),
        upvoterIds: expect.any(Array),
        success: expect.any(String),
      });
    });

    it("Returns false if current user has not upvoted the comment", async () => {
      const response = await request(app)
        .get(`/api/post_upvotes/${post2.id}`)
        .set("Authorization", `Bearer ${token}`);

      await expect(response.body).toMatchObject({
        userHasUpvoted: false,
        upvotes: expect.any(Number),
        upvoterIds: expect.any(Array),
        success: expect.any(String),
      });
    });

    it("Returns Upvoter IDs in ascending order", async () => {
      const { body } = await request(app)
        .get(`/api/post_upvotes/${post2.id}`)
        .set("Authorization", `Bearer ${token}`);

      console.log(body);

      await expect(body.upvoterIds[0].userId);
    });

    it("Defaults upvote status to false if no authorization is provided", async () => {
      const response = await request(app).get(
        `/api/comment_upvotes/${post.id}`
      );

      await expect(response.body).toMatchObject({
        userHasUpvoted: false,
        upvotes: expect.any(Number),
        upvoterIds: expect.any(Array),
        success: expect.any(String),
      });
    });
  });

  describe("POST /api/post_upvotes/add", () => {
    it("Adds one upvote & returns the new upvote data", async () => {
      const { body: preQuery } = await request(app).get(
        `/api/post_upvotes/${post2.id}`
      );

      const prevVotes = preQuery.upvotes;

      const response = await request(app)
        .post(`/api/post_upvotes/add`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          id: post2.id,
        });

      await expect(response.body).toMatchObject({
        upvoterIds: expect.arrayContaining([{ userId: user.id }]),
        success: expect.any(String),
      });
      await expect(response.body.upvotes).toEqual(prevVotes + 1);
    });
  });

  describe("DELETE /api/post_upvotes/remove", () => {
    it("Deletes & returns the prior upvote", async () => {
      const response = await request(app)
        .delete(`/api/post_upvotes/remove`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          id: post2.id,
        });

      await expect(response.body).toMatchObject({
        removedUpvote: expect.any(Object),
        success: expect.any(String),
      });
    });
  });
});
