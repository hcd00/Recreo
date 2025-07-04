require("dotenv").config(); // to load the .env file into the process.env.obj
require("express-async-errors");
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const passport = require("passport");
const passportInit = require("./passport/passportInit");
const gamesRouter = require("./routes/games");
const auth = require("./middleware/auth");
const csrf = require("host-csrf");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const app = express();

app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true }));

const url = process.env.MONGO_URI;

//connect to MONGODB
const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: url,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

//session
const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParms.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionParms));

//Passport
passportInit();
app.use(passport.initialize());
app.use(passport.session());
app.use(require("connect-flash")());
app.use(require("./middleware/storeLocals"));

//csrf
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.urlencoded({ extended: false }));
let csrf_development_mode = true;

if (app.get("env") === "production") {
  csrf_development_mode = false;
  app.set("trust proxy", 1);
}

const csrf_options = {
  protected_operations: ["POST"],
  protected_content_types: ["application/json", "multipart/form-data"],
  development_mode: csrf_development_mode,
};
const csrf_middleware = csrf(csrf_options);
app.use(csrf_middleware);

// csrfToken
app.use((req, res, next) => {
  res.locals._csrf = csrf.token(req, res);
  next();
});

//security
app.use(
  rateLimit({
    windowMS: 15 * 60 * 1000, // 15 min
    max: 100, // limit each IP to 100 requests per windowMS
  })
);
app.use(helmet());
app.use(xss());

app.get("/", (req, res) => {
  res.render("index");
});

//public folder
app.use(express.static("public"));
//session route
app.use("/sessions", require("./routes/sessionRoutes"));
// games route
app.use("/games", auth, gamesRouter);
//not found
app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
});

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await require("./db/connect")(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
