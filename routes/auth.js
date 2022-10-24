const router = require('express').Router();
const User = require("../models/User");
const bcrypt = require('bcrypt');

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Register User
router.post('/register', async (request, response) => {

    try {
        const { username, name, email, password } = request.body;
        const usernameExist = await User.findOne({ username });
        const useremailExist = await User.findOne({ email });
        if (usernameExist) return response.status(409).json("This username is already taken!");
        if (useremailExist) return response.status(409).json("Account already exist with this email.");

        // Hashed password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            name,
            email,
            password: hashedPassword,
        });

        // Add to database
        const user = await newUser.save();
        
        response.status(200).json(user);

    } catch (e) {
        console.log(e);
    }
});

// Login
router.post('/login', async (request, response) => {
    try {
        const searchId = {}
        if (request.body.user_id.includes('@')) searchId['email'] = request.body.user_id;
        else searchId['username'] = request.body.user_id;

        const user = await User.findOne(searchId);
        if (!user) {
            response.status(404).send("Wrong username/password combination!");
            return;
        }

        const validPassword = await bcrypt.compare(request.body.password, user.password);
        if (!validPassword) {
            response.status(400).json("Wrong username/password combination!");
            return;
        }

        const { password, ...others } = user._doc;
        response.status(200).json(others);

    } catch (e) {
        response.status(500).json(e);
    }
});

// Check if username available
router.get("/check", async (request, response) => {
    try {
        const userExists = await User.find({ "username": request.query.username });
        if (userExists.length > 0) return response.status(200).json({ "exists": true });
        else return response.status(200).json({ "exists": false });
    } catch (e) {
        return response.status(500).json(e);
    }
})

module.exports = router;