const Game = require('../models/Games');

const getGameBusinessLogic = async (userId, gameId) => {
    return await Game.findOne({
        _id: gameId,
        createdBy: userId
    })
}

//const getPublicGames = async (req, res) => {}


const getAllGames = async (req, res) => {
    const games = await Game.find({ createdBy: req.user._id }).sort('createdAt')
    res.render("games", { games });
}

//Finds single game and renders games
const getGame = async (req, res) => {
    const game = await getGameBusinessLogic(req.user._id, req.params.id);
    if (!game) {
        req.flash("errors", `No game with id ${req.params.id}`);
        return res.redirect("/games");
    }
    res.render("game", { game, _csrf: req.csrfToken(), errors: req.flash("errors") });
}

const joinGame = async (req, res) => {
    let status = " ";
    //gameId and userId would come from front end
    const { user: { userId, email }, params: { id: gameId } } = req;
    const game = await getGameBusinessLogic(userId, gameId);

    if (!game) {
        throw new Error(`No game with id ${gameId}`);
    }


    if (game.playerList.length >= game.maxAmountPlayers) {
        game.waitList.push(userId);
        status = `${email} has joined the waitlist for game ${gameId}`
    } else {
        game.playerList.push(userId);
        status = `${email} has joined the playerlist for game ${gameId}`
    }

    await game.save()
    return res.status(StatusCodes.OK).json({ status });
}

const showAddGame = async (req, res) => {
    res.render("game", { game: null });
}

//Creates game and adds user to player list.
const createGame = async (req, res) => {
    req.body.createdBy = req.user._id;
    const game = await Game.create(req.body);
    game.playerList.push(req.user._id);
    res.render("games", { game: null });
}

const updateGame = async (req, res) => {
    //destructure
    const { params: { id: gameId } } = req;
    //Check for atleast 1 field present.
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new Error("Atleast one field must be entered to update.")
    }
    const game = await Game.findByIdAndUpdate({ _id: gameId, createdBy: req.user._id }, req.body, { new: true, runValidators: true })
    if (!game) {
        throw new Error(`No game with id ${gameId}`);
    }
    res.render("game", { game });
}


const deleteGame = async (req, res) => {
    const { params: { id: gameId } } = req;
    const game = await Game.findByIdAndDelete({
        _id: gameId,
        createdBy: req.user._id
    })
    if (!game) {
        throw new Error(`No game with id ${gameId}`);
    }
    res.redirect('/games');
}

module.exports = {
    getAllGames,
    getGame,
    createGame,
    updateGame,
    deleteGame,
    joinGame,
    showAddGame
}