const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getProfile
} = require("../controllers/authController");

const passportAuth = require("../middleware/passportAuth");
const passport = require("../config/passport");
router.post("/register", registerUser);

router.post("/login", loginUser);
router.get("/profile", passportAuth, getProfile);
router.post(
  "/passport-login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Passport Local Authentication Successful",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    });
  }
);
module.exports = router;