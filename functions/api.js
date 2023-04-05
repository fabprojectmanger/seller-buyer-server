const express = require('express');
const app = express();
app.use(express.json());
require('dotenv').config();
const port = process.env.port || 3000;

const cors = require("cors");
const socket = require("socket.io");
const authRoutes = require("./routes/auth")
const messageRoutes = require("./routes/messages");
const nodemailer = require("nodemailer");
const router = express.Router();
const serverless = require('serverless-http');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Product = require('../model/products');
const Contacts = require("../model/contacts");
const BuyerPost = require('../model/buyerPost')
const User = require('../model/userModel')

const Messages = require('../model/messageModel')

app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://seller-buyer.netlify.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGODB_DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("DB Connetion Successfull");
})
    .catch((err) => {
        console.log(err.message);
    });


const { login, register, getAllUsers, logOut, sellerregister, } = require("./controllers/userController");
const { getMessages, addMessage } = require("./controllers/messageController")

app.use(authRoutes);
app.use(messageRoutes);
router.post("/login", login);
router.post("/register", register);
router.post("/sellerregister", sellerregister)
router.get("/allusers/:id", getAllUsers);


router.post("/addmsg/", addMessage);
router.post("/getmsg/", getMessages);


// router.post("/setavatar/:id", setAvatar);
router.get("/logout/:id", logOut);


const server = app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

const io = socket(server, {
    cors: {
        origin: "*"
    },
});


global.onlineUsers = new Map();
io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.msg);
        }
    });
});

router.post("/add-contacts", async (req, res) => {
    const { sellerEmail, sellerName, sellerID, buyerEmail, buyerName } = req.body;
    const existingUser = await Contacts.findOne(
        {
            sellerEmail: sellerEmail,
            buyerEmail: buyerEmail
        }
    );
    if (!existingUser) {
        const addContact = new Contacts({
            sellerEmail: sellerEmail,
            sellerName: sellerName,
            sellerID: sellerID,
            buyerEmail: buyerEmail,
            buyerName: buyerName,
        })
        addContact.save();
        res.send({ added: true });
    }
})

router.post("/loginuser", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user)
            return res.json({ msg: "User found", status: false });
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
            return res.json({ msg: "Incorrect Username or Password", status: false });
        delete user.password;
        return res.json({ status: true, user });
    } catch (ex) {
        next(ex);
    }
});

router.post("/buyerRegister", async (req, res, next) => {
    try {
        const { username, email, password, mobileNumber, role } = req.body;
        const emailCheck = await User.findOne({ email });
        if (emailCheck)
            return res.json({ msg: "Email already used", status: false });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            username,
            password: hashedPassword,
            mobileNumber,
            role
        });
        delete user.password;
        return res.json({ status: true, user });
    } catch (ex) {
        next(ex);
    }
});

router.post("/sellerRegister", async (req, res, next) => {
    try {
        const { username, email, password, mobileNumber, gst, pan, nameOfOrganization, role } = req.body;
        const emailCheck = await User.findOne({ email });
        if (emailCheck)
            return res.json({ msg: "Email already used", status: false });
        const hashedPassword = await bcrypt.hash(password, 10);
        const selleruser = await User.create({
            email,
            username,
            password: hashedPassword,
            mobileNumber,
            pan,
            nameOfOrganization,
            gst,
            role
        });
        delete selleruser.password;
        return res.json({ status: true, selleruser });
    } catch (ex) {
        next(ex);
    }
});

router.get("/getAllUser", async (req, res, next) => {
    try {
        const users = await User.find({ _id: { $ne: req.params.id } }).select([
            "email",
            "username",
            "avatarImage",
            "_id",
        ]);
        return res.json(users);
    } catch (ex) {
        next(ex);
    }
});

router.post("/getMessage", async (req, res, next) => {
    try {
        const { from, to } = req.body;

        const messages = await Messages.find({
            users: {
                $all: [from, to],
            },
        }).sort({ updatedAt: 1 });

        const projectedMessages = messages.map((msg) => {
            return {
                fromSelf: msg.sender.toString() === from,
                message: msg.message.text,
            };
        });
        res.json(projectedMessages);
    } catch (ex) {
        next(ex);
    }
});
router.post("/addMessages", async (req, res, next) => {
    try {
        const { from, to, message } = req.body;
        const data = await Messages.create({
            message: { text: message },
            users: [from, to],
            sender: from,
        });

        if (data) return res.json({ msg: "Message added successfully." });
        else return res.json({ msg: "Failed to add message to the database" });
    } catch (ex) {
        next(ex);
    }
});

router.post("/user-contacts", (req, res) => {
    const { email } = req.body;

    Contacts.findOne({ email: email }, (err, result) => {
        if (result) {
            const contacts = JSON.stringify(result);
            res.send({ status: true, contacts: contacts })
        }
        else {
            res.send({ status: false })
        }
    })
})

router.post('/addProduct', (req, res) => {
    const form = new formidable.IncomingForm();
    form.uploadDir = '/tmp'; // Set temporary upload directory
    form.keepExtensions = true; // Keep file extensions

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).send({ message: 'File upload failed!' });
        }

        const { title, category, subCategory, unit, location, description, tags, price, email, videoLink, pricePerUnit, nameOfOrganization, fullName, id, state, city } = fields;
        const { path: imagePath } = files.image;

        if (title === '' || category === '' || subCategory === '' || unit === '' || location === '' || tags === "" || description === "" || state === "" || city === "" || videoLink === "") {
            return res.status(400).send({ message: "Fields must not be empty!" });
        }

        try {
            // Save the product data to the database
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
                image: imagePath,
                videoLink: videoLink,
                pricePerUnit: pricePerUnit,
                nameOfOrganization: nameOfOrganization,
                fullName: fullName,
                id: id,
                state: state,
                city: city
            });

            await addProduct.save();
            res.status(200).send({ added: true });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Server error!' });
        }
    });
});

router.post("/buyerPost", (req, res) => {

    const { title, category, subCategory, location, description, tags, quantity, budget, unit, email, id, state, city } = req.body

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
        email: email,
        id: id,
        state: state,
        city: city
    })
    addPost.save()
    res.send({ added: true })
})


router.get('/category', (req, res) => {
    Product.distinct('category')
        .then(category => {
            res.json(category);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error retrieving tags');
        });
})

router.get('/categoryProduct', (req, res) => {
    Product.find({})
        .then(products => {
            res.json(products);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error retrieving posts');
        });
});


router.get('/allProducts', (req, res) => {
    Product.find({})
        .then(products => {
            res.json(products);
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Error retrieving products');
        });
});

router.post("/sellerProducts", (req, res) => {
    const { email } = req.body
    Product.find({ email: email }, (err, result) => {
        if (result) {
            res.send({ result: result })
        }
    })
})

router.post("/buyerRequirements", (req, res) => {
    const { email } = req.body
    BuyerPost.find({ email: email }, (err, result) => {
        if (result) {
            res.send({ result: result })
        }
    })
})

router.post("/profile", (req, res) => {
    const { email } = req.body
    User.findOne({ email: email }, (err, result) => {
        if (result) {
            res.send({ message: "Login Successful", result: result, loggedIn: true })
        }
    })
})

router.get('/buyerPosts', (req, res) => {
    BuyerPost.find({})
        .then(posts => {
            res.json(posts)
        }).catch(error => {
            console.error(error);
            res.status(500).send('Error retrieving posts');
        });
})

router.delete('/buyer/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedDocument = await BuyerPost.findByIdAndDelete(id);
        if (!deletedDocument) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.status(200).json(deletedDocument);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedDocument = await Product.findByIdAndDelete(id);
        if (!deletedDocument) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.status(200).json(deletedDocument);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})


router.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await User.findOneAndUpdate({ email }, { otp }, { upsert: true });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP is ${otp}. Please use this code to verify your account.`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending OTP');
        } else {
            console.log(`OTP sent to ${email}: ${otp}`);
            res.status(200).send('OTP sent');
        }
    });
});

router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, otp });
    if (user) {
        await User.deleteOne({ email });
        res.send({ verified: true });
    } else {
        res.send({ verified: false });
    }
});

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);


