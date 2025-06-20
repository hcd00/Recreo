const express = require('express');
const router = express.Router();

const { getAllGames, getGame, createGame, showAddGame, updateGame, deleteGame, joinGame } = require('../controllers/games');

router.route('/').post(createGame).get(getAllGames);
router.route('/new').get(showAddGame);
router.route('/edit/:id').get(getGame);
router.route('/update/:id').post(updateGame);
router.route('/delete/:id').post(deleteGame);

module.exports = router