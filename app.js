const express = require('express');
const app = express();
app.use(express.json());
require('dotenv').config();
const port = process.env.port || 3000
const multer = require('multer')
const axios = require('axios');
const upload = multer({ dest: 'uploads/' })
const cors = require("cors");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const mongoose = require('mongoose');
const Product = require('./model/products');
const UserRegister = require('./model/register')
const BuyerPost = require('./model/buyerPost')
const Location = require('./model/Location');
const url = 'mongodb+srv://developer:developer@node.j2lxvsn.mongodb.net/data';
app.use(cors());

function getUsernameFromEmail(email) {
    const emailArray = email.split("@");
    const username = emailArray[0];
    return username;
}
mongoose.set('strictQuery', false)
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Database connected!');
})

app.get('/', (req, res) => {
    res.send('Hello, World!');
});


app.post("/addProduct", upload.single('image'), (req, res) => {
    const { title, category, subCategory, unit, location, description, tags, price, email, videoLink, pricePerUnit, phone } = req.body
    const image = req.file?.path

    const addProduct = new Product({
        title: title,
        category: category,
        subCategory: subCategory,
        unit: unit,
        price: price,
        location: location,
        description: description,
        tags: tags,
        email: email,
        image: image,
        videoLink: videoLink,
        pricePerUnit: pricePerUnit,
        phone: phone
    })
    addProduct.save()
    res.send({ added: true })

})


app.post("/buyerPost", (req, res) => {

    const { title, category, subCategory, location, description, tags, quantity, budget } = req.body

    const addPost = new BuyerPost({
        title: title,
        category: category,
        subCategory: subCategory,
        unit: unit,
        price: price,
        location: location,
        description: description,
        tags: tags,
        quantity: quantity,
        budget: budget
    })
    addPost.save()
    res.send({ added: true })
})


app.post("/seller-register", (req, res) => {

    const { nameOfOrganization, email, gst, pan, password, phone, address, fullName, } = req.body

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log("hash error", err);
        }

        const sellerRegister = new UserRegister({
            fullName: fullName,
            nameOfOrganization: nameOfOrganization,
            email: email,
            gst: gst,
            pan: pan,
            password: hash,
            phone: phone,
            address: address,
            role: 'Seller'
        })
        sellerRegister.save()
        res.send({ register: true })
    })

})
app.post('/buyer-register', (req, res) => {

    const { fullName, email, password, phone } = req.body


    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log("hash error", err);
        }

        const buyerRegister = new UserRegister({
            fullName: fullName,
            email: email,
            password: hash,
            phone: phone,
            role: 'Buyer'
        })
        buyerRegister.save();
        res.send({ register: true })
    })

})
app.post("/login", async (req, res) => {

    const { email, password } = req.body

    UserRegister.findOne({ email: email }, (err, result) => {
        if (result) {
            bcrypt.compare(password, result.password, async (error, response) => {

                if (response) {
                    res.send({ message: "Login Successful", result: result, loggedIn: true })
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

app.get('/allProducts', (req, res) => {
    Product.find({})
        .then(products => {
            res.json(products);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error retrieving products');
        });
});

app.get('/buyerPosts', (req, res) => {
    BuyerPost.find({})
        .then(posts => {
            res.json(posts)
        }).catch(error => {
            console.error(error);
            res.status(500).send('Error retrieving posts');
        });
})


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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})