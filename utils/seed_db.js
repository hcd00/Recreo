const mongoose = require("mongoose");
const Game = require("../models/Games");
const User = require("../models/User");
const faker = require("@faker-js/faker").fakerEN_US;
const FactoryBot = require("factory-bot");
require("dotenv").config();

const testUserPassword = faker.internet.password();
const factory = FactoryBot.factory;
const factoryAdapter = new FactoryBot.MongooseAdapter();
factory.setAdapter(factoryAdapter);

factory.define("game", Game, {
  title: () => faker.lorem.words(3),
  desc: () => faker.lorem.sentence(8),
  location: () =>
    ["SF Bay Area", "New York", "Arizona", "Los Angeles", "Chicago"][
      Math.floor(5 * Math.random())
    ],
  category: () =>
    ["Soccer", "Basketball", "Running", "Pickleball"][
      Math.floor(4 * Math.random())
    ],
  startTime: () => faker.date.soon(10),
  private: () => faker.datatype.boolean(),
  maxPlayers: () => faker.number.int({ min: 5, max: 20 }),
  playerList: () => [],
  createdBy: () => new mongoose.Types.ObjectId(),
});

factory.define("user", User, {
  name: () => faker.person.fullName(),
  email: () => faker.internet.email(),
  password: () => faker.internet.password(),
});

const seed_db = async () => {
  let testUser = null;
  try {
    const mongoURL = process.env.MONGO_URI_TEST;
    await Game.deleteMany({});
    await User.deleteMany({});
    testUser = await factory.create("user", { password: testUserPassword });
    await factory.createMany("game", 20, { createdBy: testUser._id });
  } catch (e) {
    console.log("database error");
    console.log(e.message);
    throw e;
  }
  return testUser;
};

module.exports = { testUserPassword, factory, seed_db };