const express = require('express');
const router = express.Router();

const { getAllGames, getGame, createGame, showAddGame, updateGame, deleteGame, filterPublicGames, getPublicGames } = require('../controllers/games');

router.route('/').post(createGame).get(getAllGames);
router.route('/all').get(getPublicGames);
router.route('/new').get(showAddGame);
router.route('/edit/:id').get(getGame);
router.route('/update/:id').post(updateGame);
router.route('/delete/:id').post(deleteGame);
router.route('/filter').post(filterPublicGames);

module.exports = router