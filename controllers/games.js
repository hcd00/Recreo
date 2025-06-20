const Game = require('../models/Games');

const getGameBusinessLogic = async (userId, gameId) => {
    const game = await Game.findOne({
        _id: gameId,
        createdBy: userId
    })
    if (!game) {
        throw new Error(`No game with id ${gameId}`);
    }
    return game;
}

const getAllGames = async (req, res) => {
    const games = await Game.find({ createdBy: req.user._id }).sort('createdAt')
    res.render("games", { games });
}

const getGame = async (req, res) => {
    const { params: { id: gameId } } = req;
    const game = await getGameBusinessLogic(req.user._id, gameId);
    console.log("Get single game: ", game);
    res.render("game", { game });
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

const createGame = async (req, res) => {
    req.body.createdBy = req.user._id;
    const game = await Game.create(req.body);
    game.playerList.push(req.user._id);
    res.render("game", { game: null });
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