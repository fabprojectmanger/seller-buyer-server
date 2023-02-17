const express = require("express");
const app = express();
const path = require("path")
const cors = require("cors");
const cookieParser = require('cookie-parser')

const logger = require('./config/logger')

const bcrypt = require("bcrypt");
const UserRegister = require("../MongoDB/model/register");

const Post = require("../MongoDB/model/postJob")
const saltRounds = 10;
app.use(cors());
app.use(express.json());
app.use(cookieParser())
app.get("/message", (req, res) => {
    res.json({ message: "Hello from server!" });
});

require("./db/conn");
const port = process.env.port || 3000;

const static_path = path.join(__dirname, "/public")


app.use(express.static(static_path))

app.post('/sellerRegister', (req, res) => {

    const { nameOfOrganization, email, gst, pan, password, phone, address, firstName, lastName, tags, category, subCategory } = req.body

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log("hash error", err);
        }

        const newUser = new UserRegister({
            firstName: firstName,
            lastName: lastName,
            nameOfOrganization: nameOfOrganization,
            email: email,
            gst: gst,
            pan: pan,
            password: hash,
            phone: phone,
            address: address,
            tags: tags,
            category: category,
            subCategory: subCategory,
        })

        newUser.save();
        res.send("Register Successfully")
    })
})

app.post('/buyerRegister', (req, res) => {

    const { firstName, lastName, email, password, address, phone, tags, } = req.body

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log("hash error", err);
        }
        const buyerRegister = new UserRegister({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hash,
            phone: phone,
            address: address,
            tags: tags,
        })

        buyerRegister.save();
        res.send("Register Successfully")
    })


})

app.post("/post", (req, res) => {
    const { title, category, subCategory, phone, budget, location, description, tags, email } = req.body
    const postData = new Post({
        title: title,
        category: category,
        subCategory: subCategory,
        phone: phone,
        budget: budget,
        location: location,
        description: description,
        tags: tags,
        email: email
    })
    postData.save();
    res.send("Posted")
})

app.post("/login", async (req, res) => {

    const { email, password } = req.body

    UserRegister.findOne({ email: email }, (err, result) => {
        if (result) {
            bcrypt.compare(password, result.password, async (error, response) => {

                if (response) {
                    res.send({ message: "Login Successful", result: result, loggedIn: true })
                    logger.log('error', 'login successful', result)
                }
                else {
                    res.send({ status: "Password is incorrect!" });
                }
            })
        }
        else {
            res.send("User Not Register")
        }
    })
})

app.use((req, res, next) => {
    let oldSend = res.send;
    res.send = function (data) {
        oldSend.apply(res, arguments)
    }
    next();
})

app.post("/getData", (req, res) => {
    const { email } = req.body
    UserRegister.findOne({ email: email }, (err, result) => {
        if (result) {
            res.send({ message: "Login Successful", result: result, loggedIn: true })
        }
    })
})

app.post("/getSellerPost", (req, res) => {
    Post.find({}, (err, result) => {
        if (result) {
            res.send(result)
        }
    })
})

app.listen(port, () => {
    console.log('info', `Server is running on port ${port}`)
})