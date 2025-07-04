const { app } = require("../app");
const { seed_db, factory } = require("../utils/seed_db");
const faker = require("@faker-js/faker").fakerEN_US;
const get_chai = require("../utils/get_chai");
const User = require("../models/User");
const { request } = require("express");

describe("tests for registration and logon", function () {
  it("should get registration page", async () => {
    const { expect, request } = await get_chai();
    const req = request.execute(app).get("/sessions/register").send();
    const res = await req;
    expect(res).to.have.status(200);
    expect(res).to.have.property("text");
    expect(res.text).to.include("Enter your name");
    const textNoLineEnd = res.text.replaceAll("\n", "");
    const csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd);
    expect(csrfToken).to.not.be.null;
    this.csrfToken = csrfToken[1];
    expect(res).to.have.property("headers");
    expect(res.headers).to.have.property("set-cookie");
    const cookies = res.headers["set-cookie"];
    this.csrfCookie = cookies.find((element) =>
      element.startsWith("csrfToken")
    );
    console.log("register page cookie:", this.csrfCookie);
    expect(this.csrfCookie).to.not.be.undefined;
  });

  it("should register the user", async () => {
    const { expect, request } = await get_chai();
    this.password = faker.internet.password();
    this.user = await factory.build("user", { password: this.password });
    const dataToPost = {
      name: this.user.name,
      email: this.user.email,
      password: this.password,
      password1: this.password,
      _csrf: this.csrfToken,
    };
    console.log("cookie: ", this.csrfCookie);
    console.log("Data:", dataToPost);
    const req = request
      .execute(app)
      .post("/sessions/register")
      .set("Cookie", this.csrfCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .send(dataToPost);
    const res = await req;
    expect(res).to.have.status(200);
    expect(res).to.have.property("text");
    expect(res.text).to.include("All Games");
  });

  it("should log the user on", async () => {
    const dataToPost = {
      email: this.user.email,
      password: this.password,
      _csrf: this.csrfToken,
    };
    const { expect, request } = await get_chai();
    const req = request
      .execute(app)
      .post("/sessions/logon")
      .set("Cookie", this.csrfCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .redirects(0)
      .send(dataToPost);
    const res = await req;
    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal("/");
    const cookies = res.headers["set-cookie"];
    this.sessionCookie = cookies.find((element) =>
      element.startsWith("connect.sid")
    );
    expect(this.sessionCookie).to.not.be.undefined;
  });

  it("should get the index page", async () => {
    const { expect, request } = await get_chai();
    const req = request
      .execute(app)
      .get("/")
      .set("Cookie", `${this.csrfCookie}; ${this.sessionCookie}`)
      .send();
    const res = await req;
    expect(res).to.have.status(200);
    expect(res).to.have.property("text");
    expect(res.text).to.include("Find or host your next game!");
  });

  it("should log the user off", async () => {
    const { expect, request } = await get_chai();

    const dataToPost = {
      _csrf: this.csrfToken,
    };

    const req = request
      .execute(app)
      .post("/sessions/logoff")
      .set("Cookie", this.csrfToken + ";" + this.sessionCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .send(dataToPost);

    const res = await req;
    expect(res).to.have.status(200);
    expect(res).to.have.property("text");
    expect(res.text).to.include("Log in");
  });
});

// let csrfToken;
// let csrfCookie;
// let sessionCookie;
// let testUser;
// let testPassword;

// describe("tests for registration and logon", function () {
//   // after(() => {
//   //   server.close();
//   // });
//   it("should get the registration page", async function () {
//     // const {a expect, request } = await get_chai();
//     const req = request.execute(app).get("/sessions/register").send();
//     const res = await req;
//     expect(res).to.have.status(200);
//     expect(res).to.have.property("text");
//     expect(res.text).to.include("Enter your name");
//     const textNoLineEnd = res.text.replaceAll("\n", "");
//     const csrfTokenMatch = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd);
//     expect(csrfToken).to.not.be.null;

//     csrfToken = csrfTokenMatch[1];
//     expect(res).to.have.property("headers");
//     expect(res.headers).to.have.property("set-cookie");
//     const cookies = res.headers["set-cookie"];
//     csrfCookie = cookies.find((element) => element.startsWith("csrfToken"));
//     expect(csrfCookie).to.not.be.undefined;
//   });

//   it("should register the user", async () => {
//     const { expect, request } = await get_chai();
//     testPassword = faker.internet.password();
//     testUser = await factory.build("user", { password: testPassword });
//     const dataToPost = {
//       name: testUser.name,
//       email: testUser.email,
//       password:testPassword,
//       password1: testPassword,
//       _csrf: csrfToken,
//     };

//     const req = request
//       .execute(app)
//       .post("/sessions/register")
//       .set("Cookie", csrfCookie.split(";")[0])
//       .set("content-type", "application/x-www-form-urlencoded")
//       .send(dataToPost);

//       console.log("Register dataToPost:", dataToPost);
// console.log("CSRF cookie:", csrfCookie.split(";")[0]);

//     const res = await req;
//     console.log("Register response status:", res.status);
//   console.log("Register response text:", res.text);
//   console.log("Res bodu", res.body)
//     expect(res).to.have.status(200);
//     expect(res).to.have.property("text");
//     expect(res.text).to.include("All Games");
//     newUser = await User.findOne({ email: testUser.email });
//     expect(newUser).to.not.be.null;
//   });

// //   it("should log the user on", async function () {
// //     const dataToPost = {
// //       email: this.user.email,
// //       password: this.password,
// //       _csrf: this.csrfToken,
// //     };
// //     const { expect, request } = await get_chai();
// //     const req = request
// //       .execute(app)
// //       .post("/session/logon")
// //       .set("Cookie", this.csrfCookie)
// //       .set("content-type", "application/x-www-form-urlencoded")
// //       .redirects(0)
// //       .send(dataToPost);
// //     const res = await req;
// //     expect(res).to.have.status(302);
// //     expect(res.headers.location).to.equal("/");
// //     const cookies = res.headers["set-cookie"];
// //     this.sessionCookie = cookies.find((element) =>
// //       element.startsWith("connect.sid")
// //     );
// //     expect(this.sessionCookie).to.not.be.undefined;
// //   });

// //   it("should get the index page", async function () {
// //     const { expect, request } = await get_chai();
// //     const req = await request
// //       .execute(app)
// //       .get("/")
// //       .set("Cookie", `${this.csrfCookie}; ${this.sessionCookie}`)
// //       .send();
// //     const res = await req;
// //     expect(res).to.have.status(200);
// //     expect(res).to.have.property("text");
// //     expect(res.text).to.include(this.user.name);
// //   });

//   //   it("should log the user off", async function () {
//   //     const req = request.set(
//   //       "Cookie",
//   //       this.csrfToken + ";" + this.sessionCookie
//   //     );
//   //   });
// });
