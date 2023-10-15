const express = require("express");

const { validateBody, authenticate, upload } = require("../../middlewares");
const {
  userSchema: { registerSchema, loginSchema, emailSchema },
} = require("../../utils");

const ctrl = require("../../controllers/userControllers");

const router = express.Router();

router.post("/users/register", validateBody(registerSchema), ctrl.register);

router.get("/users/verify/:verificationToken", ctrl.verifyEmail);

router.post("/users/verify", validateBody(emailSchema), ctrl.resendVerifyEmail);

router.post("/users/login", validateBody(loginSchema), ctrl.login);

router.get("/users/current", authenticate, ctrl.getCurrent);

router.post("/users/logout", authenticate, ctrl.logout);

router.patch("/users/avatars", authenticate, upload.single("avatar"), ctrl.updateAvatar);

module.exports = router;
