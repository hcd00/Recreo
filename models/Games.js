const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Name for your game is required."],
        maxlength: 50
    },
    desc: {
        type: String,
        default: "Join up!",
        maxlength: 200
    },
    location: {
        type: String,
        enum: ['SF Bay Area', 
            'New York',
            'Arizona',
            'Los Angeles',
            'Chicago'
        ],
        required: [true, "Location of your game is required."]
    },
    category: {
        type: String,
        enum: ['Soccer', 'Basketball', 'Running', 'Pickleball'],
        required: [true, "Category is required."]
    },
    startTime: {
        type: Date,
        required: [true, "Start time is required."]
    },
    private: {
        type: Boolean,
        default: false
    },
    isFull: {
        type: Boolean,
        default: false
    },
    maxPlayers: {
        type: Number,
        default: 20
    },
    playerList: {
        type: [mongoose.Types.ObjectId],
        ref: "User",
        default: [],
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, "User is required to create game."]
    }

}, { timestamps: true })


module.exports = mongoose.model('Game', GameSchema);