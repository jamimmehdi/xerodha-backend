const mongoose = require('mongoose');

const SoldSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    symbol: {
        type: String,
        required: true
    },
    selling_price: {
        type: Number,
        required: true
    },
    selling_date: {
        type: Date,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    revenue: {
        type: Number,
        required: true
    },
    revenue_percent: {
        type: Number,
        required: true
    },
    holding_id: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Sold', SoldSchema);