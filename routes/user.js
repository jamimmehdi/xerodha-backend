const router = require('express').Router();
const User = require('../models/User');
const Holdings = require('../models/Holdings');
const Purchase = require('../models/Purchase');
const Sold = require('../models/Sold');
const stocksList = require('../utils/stocksList');

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Get user balance
router.get('/balance/:user_id', async (request, response) => {
    try {
        const user = await User.findById(request.params.user_id);

        if (!user) return response.status(400).json(`User does not exit with USER_ID:${request.params.user_id}`);
        const { opening_balance, margin_available, margin_used } = user;
        response.status(200).json({ opening_balance, margin_available, margin_used });

    } catch (err) {
        return response.status(500).json(err);
    }
});

// Add/Remove to watchlist
router.put('/watchlist_activity', async (request, response) => {
    try {
        const user = await User.findById(request.body.user_id);
        if (!user) return response.status(400).json(`User does not exit with USER_ID:${request.body.user_id}`);

        if (user.watchlist.includes(request.body.symbol)) {
            await user.updateOne({ $pull: { watchlist: request.body.symbol } });
            const updated = await User.findById(request.body.user_id);
            const { password, ...others } = updated._doc;
            response.status(200).json(others);
        } else {
            await user.updateOne({ $push: { watchlist: request.body.symbol } });
            const updated = await User.findById(request.body.user_id);
            const { password, ...others } = updated._doc;
            response.status(200).json(others);
        }

    } catch (err) {
        return response.status(500).json(err);
    }
});


// Search for quotes
router.get('/search/:keyword', async (request, response) => {
    try {
        const filteredQuotes = stocksList().filter((quote) => {
            if (quote.symbol.toLowerCase().includes(request.params.keyword.toLowerCase())
                || quote.name.toLowerCase().includes(request.params.keyword.toLowerCase())
            ) return quote;
        })

        return response.status(200).json(filteredQuotes.slice(0, 20));
    } catch (err) {
        return response.status(500).json(err);
    }
});


// Buy stock
router.post('/buy', async (request, response) => {
    try {
        const { quantity, buying_price, symbol, user_id } = request.body;
        const spent = quantity * buying_price;

        const user = await User.findById(user_id);
        await user.update({ $set: { margin_available: user.margin_available - spent, margin_used: user.margin_used + spent } });

        const newHolding = await new Holdings({ user_id, symbol, quantity, buying_price }).save();
        const newPurchase = await new Purchase(request.body).save();

        return response.status(200).json({ holding: newHolding, purchase: newPurchase });
    } catch (err) {
        return response.status(500).json(err);
    }
});


// Sell stock
router.post('/sell', async (request, response) => {
    try {
        const { quantity, selling_price, symbol, user_id, holding_id } = request.body;
        const return_price = quantity * selling_price;

        const user = await User.findById(user_id);
        await user.update({ $set: { margin_available: user.margin_available + return_price } });

        const holding = await Holdings.findById(holding_id);

        const revenue = return_price - (holding.buying_price * quantity);
        const revenue_percent = Math.floor(revenue / (holding.buying_price * quantity) * 100);

        await holding.updateOne({ $set: { quantity: holding.quantity - quantity } });

        const updatedHolding = await Holdings.findById(holding_id);
        const newSold = await new Sold({ ...request.body, revenue, revenue_percent }).save();

        return response.status(200).json({ holding: updatedHolding, sold: newSold });
    } catch (err) {
        return response.status(500).json(err);
    }
});

// Get all holdings
router.get('/holdings/:user_id', async (request, response) => {
    try {
        const { user_id } = request.params;

        const holdings = await Holdings.find({ user_id });

        return response.status(200).json(holdings);
    } catch (err) {
        return response.status(500).json(err);
    }
});

// Get all purchase
router.get('/purchase/:user_id', async (request, response) => {
    try {
        const { user_id } = request.params;

        const purchase = await Purchase.find({ user_id });

        return response.status(200).json(purchase);
    } catch (err) {
        return response.status(500).json(err);
    }
});

// Get all sold
router.get('/sold/:user_id', async (request, response) => {
    try {
        const { user_id } = request.params;

        const sold = await Sold.find({ user_id });

        return response.status(200).json(sold);
    } catch (err) {
        return response.status(500).json(err);
    }
});

module.exports = router;