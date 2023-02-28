const express = require("express");
const app = express();
const path = require("path")
const cors = require("cors");
const cookieParser = require('cookie-parser')
const { isEmail } = require('validator');
const logger = require('./config/logger')
const bcrypt = require("bcrypt");
const axios = require('axios');
const requestIp = require('request-ip');

app.use(requestIp.mw());

const UserRegister = require("../userlogs/model/register")
const Post = require("../userlogs/model/postJob");
const Location = require("../userlogs/model/location");

function getUsernameFromEmail(email) {
    const emailArray = email.split("@");
    const username = emailArray[0];
    return username;
}


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


const ipinfoToken = 'bf73537cbb17e7'

axios.get('https://ipinfo.io?token=' + ipinfoToken)

    .then(async (response) => {
        const existingLocation = await Location.findOne({ ip: response.data.ip });
        if (existingLocation) {
            console.log('Document with same IP address already exists');
        }
        else {
            const location = new Location({
                ip: response.data.ip,
                region: response.data.region,
                city: response.data.city,
                country: response.data.country,
            })

            location.save()
            console.log("Location Saved")
        }
    })

app.post('/sellerRegister', async (req, res) => {

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/

    const { nameOfOrganization, email, gst, pan, password, phone, address, firstName, lastName, tags, category, subCategory } = req.body
    const username = getUsernameFromEmail(email);
    const existingUser = await UserRegister.findOne({ email: req.body.email });

    if (firstName === '' || lastName === '' || email === '' || password === '' || phone === '' || address === '' || tags === '') {
        res.send({ message: "Fields must not be empty!" })
    }

    else if (!isEmail(email)) {
        res.send({ message: "Invalid Email" })
    }
    else if (existingUser) {
        res.send({ message: "Email already in use" })
    }
    else if (!passwordRegex.test(password)) {
        res.send({ message: "Weak Password" })
    }
    else if (gst.length < 15) {
        res.send({ message: "GST  number must contain 15 characters" })
    }
    else if (!gstRegex.test(gst)) {
        res.send({ message: "GST  number invalid" })
    }
    else if (pan.length < 10) {
        res.send({ message: "PAN number must contain 10 characters" })
    }
    else if (!panRegex.test(pan)) {
        res.send({ message: "PAN number invalid" })
    }
    else if (phone.length < 10) {
        res.send({ message: "Phone number must contain 10 characters" })
    }

    else {

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
                username: username
            })
            newUser.save()
            res.send("Register Successfully")
        })
    }
})

app.post('/buyerRegister', async (req, res) => {

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/
    const existingUser = await UserRegister.findOne({ email: req.body.email });

    const { firstName, lastName, email, password, address, phone, tags, } = req.body
    const username = getUsernameFromEmail(email);

    if (firstName === '' || lastName === '' || email === '' || password === '' || phone === '' || address === '' || tags === '') {
        res.send({ message: "Fields must not be empty!" })
    }

    else if (!isEmail(email)) {
        res.send({ message: "Invalid Email" })
    }
    else if (existingUser) {
        res.send({ message: "Email already in use" })
    }

    else if (!passwordRegex.test(password)) {
        res.send({ message: "Weak Password" })
    }
    else if (phone.length < 10) {
        res.send({ message: "Phone number must contain 10 characters" })
    }

    else {
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
                username: username
            })
            buyerRegister.save();
            res.send("Register Successfully")
        })
    }
})

app.post("/post", (req, res) => {
    const { title, category, subCategory, phone, budget, location, description, tags, email } = req.body

    if (title === "" || category === "" || subCategory === "" || phone === "" || budget === "" || location === "" || description === "" || tags === "") {
        res.send({ message: "Fields must not be empty!" })
    }
    else if (budget < 0) {
        res.send({ message: "Budget should not be negative" })
    }
    else if (phone.length < 10) {
        res.send({ message: "Phone number must contain 10 characters" })
    }

    else {
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
        postData.save()
        res.send("Posted")
    }
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
            res.send({ status: "Invalid Email and Password" })
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

app.post("/sellerPost", (req, res) => {
    const { email } = req.body
    Post.find({ email: email }, (err, result) => {
        if (result) {
            res.send({ result: result })
        }
    })
})

app.get('/tags', (req, res) => {
    Post.distinct('tags')
        .then(tags => {
            res.json(tags);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error retrieving tags');
        });
});

app.get('/tagPost', (req, res) => {
    Post.find({})
        .then(posts => {
            res.json(posts);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error retrieving posts');
        });
});

app.get('/category', (req, res) => {
    Post.distinct('category')
        .then(subCategory => {
            res.json(subCategory);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error retrieving category');
        });
})

app.get('/subCategory', (req, res) => {
    Post.distinct('subCategory')
        .then(subCategory => {
            res.json(subCategory);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error retrieving category');
        });
})

app.get('/api/:category/:subCategory', (req, res) => {

    const { category, subCategory } = req.params;

    Post.find({ category, subCategory }, (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal server error');
            return;
        }
        res.json(results);
    });
});



app.listen(port, () => {
    console.log('info', `Server is running on port ${port}`)
})