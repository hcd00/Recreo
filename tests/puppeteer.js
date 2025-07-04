const puppeteer = require("puppeteer");
require("../app");
const { seed_db, testUserPassword } = require("../utils/seed_db");
const Game = require("../models/Games");

let testUser = null;
let page = null;
let browser = null;

describe("games puppeteer test", function () {
  before(async function () {
    this.timeout(10000);
    //await sleeper(5000)
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto("http://localhost:3000");
  });
  after(async function () {
    this.timeout(5000);
    await browser.close();
  });
  describe("got to site", function () {
    it("should have completed a connection", async function () {});
  });
  describe("index page test", function () {
    this.timeout(10000);
    it("finds the index page logon link", async function () {
      this.logonLink = await page.waitForSelector("a ::-p-text(Log in)");
    });
    it("gets to the logon page", async function () {
      await this.logonLink.click();
      await page.waitForNavigation();
      const email = await page.waitForSelector('input[name="email"]');
    });
  });
  describe("logon page test", function () {
    this.timeout(20000);
    it("resolves all the fields", async () => {
      this.email = await page.waitForSelector('input[name="email"]');
      this.password = await page.waitForSelector('input[name="password"]');
      this.submit = await page.waitForSelector("button ::-p-text(Logon)");
    });
    it("sends the logon", async () => {
      testUser = await seed_db();
      await this.email.type(testUser.email);
      await this.password.type(testUserPassword);
      await this.submit.click();
      await page.waitForNavigation();
      await page.waitForSelector(`p ::-p-text(${testUser.name} is logged on.)`);
      const copyr = await page.waitForSelector("p ::-p-text(copyright)");
      const copyrText = await copyr.evaluate((el) => el.textContent);
      console.log("copyright text: ", copyrText);
    });
  });
});

describe("Game CRUD operations", function () {
  this.timeout(20000);

  it("clicks the link for the games list and checks for ~20 entries", async function () {
    const gamesLink = await page.waitForSelector(
      "a ::-p-text(View your games)"
    );

    await gamesLink.click();

    await page.waitForNavigation();

    await page.waitForSelector("table");

    const content = await page.content();

    const numRows = content.split("<tr").length - 1;
  });

  it("should click 'Add A Game' and verify the form fields", async function () {
    const { expect } = await import("chai");
    const addGameButton = await page.waitForSelector("a ::-p-text(Add A Game)");
    await addGameButton.click();

    await page.waitForSelector("form");

    const titleField = await page.waitForSelector('input[name="title"]');
    const descField = await page.waitForSelector('textarea[name="desc"]');
    const addButton = await page.waitForSelector("button ::-p-text(Add)");

    expect(titleField).to.not.be.undefined;
    expect(descField).to.not.be.undefined;
    expect(addButton).to.not.be.undefined;
  });

  it("should add a new game and verify it appears in the DB", async function () {
    const { expect } = await import("chai");

    const testTitle = "Puppeteer Test Game";
    const testDesc = "This is a test game created by puppeteer";

    const titleField = await page.waitForSelector('input[name="title"]');
    await titleField.type(testTitle);

    const descField = await page.waitForSelector('textarea[name="desc"]');
    await descField.type(testDesc);

    const addButton = await page.waitForSelector("button ::-p-text(Add)");
    await addButton.click();

    await page.waitForNavigation();

    const pageContent = await page.content();
    expect(pageContent).to.include("game listing added");

    const games = await Game.find({}).sort({ createdAt: -1 }).limit(1);
    expect(games.length).to.equal(1);
    const latestGame = games[0];

    expect(latestGame.title).to.equal(testTitle);
    expect(latestGame.desc).to.equal(testDesc);
  });
});
