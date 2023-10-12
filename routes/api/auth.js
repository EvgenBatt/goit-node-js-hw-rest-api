const express = require("express");

const { validateBody, authenticate, upload } = require("../../middlewares");
const {
  userSchema: { registerSchema, loginSchema },
} = require("../../utils");

const ctrl = require("../../controllers/userControllers");

const router = express.Router();

router.post("/users/register", validateBody(registerSchema), ctrl.register);

router.post("/users/login", validateBody(loginSchema), ctrl.login);

router.get("/users/current", authenticate, ctrl.getCurrent);

router.post("/users/logout", authenticate, ctrl.logout);

router.patch("/users/avatars", authenticate, upload.single("avatar"), ctrl.updateAvatar);

module.exports = router;
