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
const mongodb = require('mongodb')
const Product = require('./model/products');
const UserRegister = require('./model/register')
const { isEmail } = require('validator');
const BuyerPost = require('./model/buyerPost')
const Location = require('./model/Location');
const url = 'mongodb+srv://developer:developer@node.j2lxvsn.mongodb.net/data';
app.use(cors());
app.use('/uploads', express.static('uploads'))

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

    const { title, category, subCategory, location, description, tags, quantity, budget, unit, email } = req.body

    const addPost = new BuyerPost({
        title: title,
        category: category,
        subCategory: subCategory,
        unit: unit,
        location: location,
        description: description,
        tags: tags,
        quantity: quantity,
        budget: budget,
        email: email
    })
    addPost.save()
    res.send({ added: true })
})


app.post("/seller-register", async (req, res) => {


    const { nameOfOrganization, email, gst, pan, password, phone, address, fullName, } = req.body
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/
    const existingUser = await UserRegister.findOne({ email: req.body.email });

    if (fullName === '' || email === '' || password === '' || phone === '' || nameOfOrganization === '' || gst === "" || pan === "" || address === "") {
        res.send({ message: "Fields must not be empty!" })
    }

    else if (!isEmail(email)) {
        res.send({ message: "Invalid Email" })
    }
    else if (existingUser) {
        res.send({ message: "Email already in use" })
    }

    else if (!passwordRegex.test(password)) {
        res.send({ message: " Password must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters" })
    }
    else if (phone.length < 10) {
        res.send({ message: "Phone number must contain 10 characters" })
    }
    else {

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
            res.send("Register Successfully")
        })
    }
})
app.post('/buyer-register', async (req, res) => {

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/
    const existingUser = await UserRegister.findOne({ email: req.body.email });
    const { fullName, email, password, phone } = req.body

    if (fullName === '' || email === '' || password === '' || phone === '') {
        res.send({ message: "Fields must not be empty!" })
    }

    else if (!isEmail(email)) {
        res.send({ message: "Invalid Email" })
    }
    else if (existingUser) {
        res.send({ message: "Email already in use" })
    }

    else if (!passwordRegex.test(password)) {
        res.send({ message: " Password must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters" })
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
                fullName: fullName,
                email: email,
                password: hash,
                phone: phone,
                role: 'Buyer'
            })
            buyerRegister.save();
            res.send("Register Successfully")
        })
    }
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


app.get('/category', (req, res) => {
    Product.distinct('category')
        .then(category => {
            res.json(category);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error retrieving tags');
        });
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


app.post("/sellerProducts", (req, res) => {
    const { email } = req.body
    Product.find({ email: email }, (err, result) => {
        if (result) {
            res.send({ result: result })
        }
    })
})

app.post("/buyerRequirements", (req, res) => {
    const { email } = req.body
    BuyerPost.find({ email: email }, (err, result) => {
        if (result) {
            res.send({ result: result })
        }
    })
})

app.post("/profile", (req, res) => {
    const { email } = req.body
    UserRegister.findOne({ email: email }, (err, result) => {
        if (result) {
            res.send({ message: "Login Successful", result: result, loggedIn: true })
        }
    })
})

app.get('/buyerPosts', (req, res) => {
    BuyerPost.find({})
        .then(posts => {
            res.json(posts)
        }).catch(error => {
            console.error(error);
            res.status(500).send('Error retrieving posts');
        });
})

app.delete('/buyerPost/:id', async (req, res) => {
    const result = await BuyerPost.deleteOne({ _id: new mongodb.ObjectId(req.params.id) })
    res.send(result)
})

// app.delete('/products/:id', async (req, res) => {
//     const result = await Product.deleteOne({ _id: new mongodb.ObjectId(req.params.id) })
//     res.send(result)
// })


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