const {
  login,
  register,
  getAllUsers,
  logOut,
  sellerregister,
} = require("../controllers/userController");

const router = require("express").Router();

router.post("/login", login);
router.post("/register", register);
router.post("/sellerregister", sellerregister)
router.get("/allusers/:id", getAllUsers);

// router.post("/setavatar/:id", setAvatar);
router.get("/logout/:id", logOut);

module.exports = router;
