const Game = require("../models/Games");
const gameSchema = require("../utils/gameValidator");
const getGameBusinessLogic = async (userId, gameId) => {
  return await Game.findOne({
    _id: gameId,
    createdBy: userId,
  });
};

const getPublicGames = async (req, res) => {
  try {
    const games = await Game.find({ private: false });
    res.render("games", { games });
  } catch (err) {
    console.error("Error fetching public games:", err);
    req.flash("errors", "Unable to fetch public games.");
    res.redirect("/games");
  }
};

const getAllGames = async (req, res) => {
  const games = await Game.find({ createdBy: req.user._id }).sort("createdAt");
  res.render("games", { games });
};

//Finds single game and renders games
const getGame = async (req, res) => {
  const game = await getGameBusinessLogic(req.user._id, req.params.id);
  if (!game) {
    req.flash("errors", `No game with id ${req.params.id}`);
    return res.redirect("/games");
  }
  res.render("game", { game, errors: req.flash("errors") });
};

const joinGame = async (req, res) => {
  let status = " ";
  //gameId and userId would come from front end
  const {
    user: { userId, email },
    params: { id: gameId },
  } = req;
  const game = await getGameBusinessLogic(userId, gameId);

  if (!game) {
    throw new Error(`No game with id ${gameId}`);
  }

  if (game.playerList.length >= game.maxAmountPlayers) {
    game.waitList.push(userId);
    status = `${email} has joined the waitlist for game ${gameId}`;
  } else {
    game.playerList.push(userId);
    status = `${email} has joined the playerlist for game ${gameId}`;
  }

  await game.save();
  return res.status(StatusCodes.OK).json({ status });
};

const showAddGame = async (req, res) => {
  res.render("game", { game: null });
};

//Creates game and adds user to player list.
const createGame = async (req, res) => {
  try {
    const result = await gameSchema.validateAsync(req.body, {
      abortEarly: false,
      //need flag for csrf
      allowUnknown: true,
    });
    result.createdBy = req.user._id;
    result.private = false;
    const game = await Game.create(result);
    game.playerList.push(req.user._id);
    await game.save();
    res.redirect("/games");
  } catch (error) {
    let messages = [];
    console.log("Joi Validation Error:", error.details);
    req.flash(
      "errors",
      error.details.map((e) => e.message)
    );
    res.redirect("/games/new");
    if (error.isJoi && error.details) {
      messages = error.details.map((e) => e.message);
    } else {
      messages.push("Something went wrong.");
    }

    req.flash("errors", messages);
    return res.redirect("/games");
  }
};

const updateGame = async (req, res) => {
  await gameSchema.validateAsync(req.body, {
    abortEarly: false,
    allowUnknown: true,
  });
  //destructure
  const {
    params: { id: gameId },
  } = req;
  //Check for atleast 1 field present.
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new Error("Atleast one field must be entered to update.");
  }

  const game = await Game.findByIdAndUpdate(
    {
      _id: gameId,
      createdBy: req.user._id,
    },
    req.body,
    { new: true, runValidators: true }
  );

  if (!game) {
    req.flash("errors", `No game with id ${gameId}`);
    return res.redirect("/games");
  }

  return res.redirect("/games");
};

const deleteGame = async (req, res) => {
  const {
    params: { id: gameId },
  } = req;
  const game = await Game.findByIdAndDelete({
    _id: gameId,
    createdBy: req.user._id,
  });
  if (!game) {
    req.flash("errors", `No game with id ${gameId}`);
    return res.redirect("/games");
  }
  return res.redirect("/games");
};

const filterPublicGames = async (req, res) => {
  //need content from body of request
  const games = await Game.find({ location: req.body.location, private: false }).sort(
    "createdAt"
  );
  res.render("games", { games });
};

module.exports = {
  getAllGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
  joinGame,
  showAddGame,
  getPublicGames,
  filterPublicGames,
};
