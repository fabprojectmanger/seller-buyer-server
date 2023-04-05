const User = require("../../model/messageModel");
const bcrypt = require("bcryptjs");


// module.exports.login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user)
//       return res.json({ msg: "Username not found", status: false });
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid)
//       return res.json({ msg: "Incorrect Username or Password", status: false });
//     delete user.password;
//     return res.json({ status: true, user });
//   } catch (ex) {
//     next(ex);
//   }
// };

// module.exports.register = async (req, res, next) => {
//   try {
//     const { username, email, password, mobileNumber, role } = req.body;
//     const usernameCheck = await User.findOne({ email });
//     // if (usernameCheck)
//     //   return res.json({ msg: "Username already used", status: false });
//     const emailCheck = await User.findOne({ email });
//     if (emailCheck)
//       return res.json({ msg: "Email already used", status: false });
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({
//       email,
//       username,
//       password: hashedPassword,
//       mobileNumber,
//       role
//     });
//     delete user.password;
//     return res.json({ status: true, user });
//   } catch (ex) {
//     next(ex);
//   }
// };
// module.exports.sellerregister = async (req, res, next) => {
//   try {
//     const { username, email, password, mobileNumber, gst, pan, nameOfOrganization, role } = req.body;
//     const usernameCheck = await User.findOne({ username });
//     // if (usernameCheck)
//     //   return res.json({ msg: "Username already used", status: false });
//     const emailCheck = await User.findOne({ email });
//     if (emailCheck)
//       return res.json({ msg: "Email already used", status: false });
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const selleruser = await User.create({
//       email,
//       username,
//       password: hashedPassword,
//       mobileNumber,
//       pan,
//       nameOfOrganization,
//       gst,
//       role
//     });
//     delete selleruser.password;
//     return res.json({ status: true, selleruser });
//   } catch (ex) {
//     next(ex);
//   }
// };

// module.exports.getAllUsers = async (req, res, next) => {
//   try {
//     const users = await User.find({ _id: { $ne: req.params.id } }).select([
//       "email",
//       "username",
//       "avatarImage",
//       "_id",
//     ]);
//     return res.json(users);
//   } catch (ex) {
//     next(ex);
//   }
// };

// module.exports.logOut = (req, res, next) => {
//   try {
//     if (!req.params.id) return res.json({ msg: "User id is required " });
//     onlineUsers.delete(req.params.id);
//     return res.status(200).send();
//   } catch (ex) {
//     next(ex);
//   }
// };
