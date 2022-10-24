const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        min: 3,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 6
    },
    watchlist: {
        type: Array,
        default: []
    },
    opening_balance: {
        type: Number,
        default: 1000000,
    },
    margin_available: {
        type: Number,
        default: 1000000,
    },
    margin_used: {
        type: Number,
        default: 0,
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', UserSchema);