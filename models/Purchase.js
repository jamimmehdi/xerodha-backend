const mongoose = require('mongoose');

const PhurchaseSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    symbol: {
        type: String,
        required: true
    },
    buying_price: {
        type: Number,
        required: true
    },
    buying_date: {
        type: Date,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Phurchase', PhurchaseSchema);