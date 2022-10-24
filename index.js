const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const userRoute = require('./routes/user');
const authRoute = require('./routes/auth');
const PORT = process.env.PORT || 4000;
app.use(cors());

dotenv.config();

mongoose.connect(
    process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log('Connected to database...')
});

// Middleware
app.use(express.json());
app.use(morgan('common'));

app.use('/api/v1/user', userRoute);
app.use('/api/v1/auth', authRoute);

app.listen(PORT, () => console.log('Server started...'));