const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGO_DATABASE,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("connected successfully"))
    .catch((err) => console.log(err))








