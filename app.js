const express = require('express');
const app = express();
app.use(express.json());

const port = process.env.port || 3000
const multer = require('multer')
const axios = require('axios');
const upload = multer({ dest: 'uploads/' })

const mongoose = require('mongoose');
const Product = require('./model/products');
const UserRegister = require('./model/register')
const BuyerPost = require('./model/buyerPost')
const Location = require('./model/Location');
const url = 'mongodb+srv://developer:developer@node.j2lxvsn.mongodb.net/data';

function getUsernameFromEmail(email) {
    const emailArray = email.split("@");
    const username = emailArray[0];
    return username;
}
mongoose.set('strictQuery', false)
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true,  });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Database connected!');
})

app.get('/', (req, res) => {
    res.send('Hello, World!');
});


app.post("/addProduct", upload.single('image'), (req, res) => {
    const { title, category, subCategory, unit, location, description, tags, price, email, videoLink, pricePerUnit, name, nameOfOrganization, phone } = req.body
    const image = req.file?.path
    if (title === "" || category === "" || subCategory === "" || unit === "" || location === "" || description === "" || tags === "") {
        res.send({ message: "Fields must not be empty!" })
    }

    else {
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
            name: name,
            nameOfOrganization: nameOfOrganization,
            phone: phone
        })
        addProduct.save()
        res.send({ added: true })
    }
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
    // else if (!gstRegex.test(gst)) {
    //     res.send({ message: "GST  number invalid" })
    // }
    else if (pan.length < 10) {
        res.send({ message: "PAN number must contain 10 characters" })
    }
    // else if (!panRegex.test(pan)) {
    //     res.send({ message: "PAN number invalid" })
    // }
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

app.get('/allProducts', (req, res) => {
    Product.find({})
        .then(products => {
            res.json(products);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error retrieving posts');
        });
});


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