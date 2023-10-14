const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const Jimp = require("jimp");
const fs = require("fs/promises");
const { nanoid } = require("nanoid");

const User = require("../models/users");
const { HttpError, controllerWrapper, sendEmail } = require("../utils");

const { SECRET_KEY, BASE_URL } = process.env;

const avatarDir = path.join(__dirname, "../", "public", "avatars");

/**
 * The function registers a new user by checking if the email is already in use, hashing the password,
 * creating a new user with the hashed password, and returning the user's email and subscription in the
 * response.
 */
const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw new HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();

  const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL, verificationToken });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

/**
 * The function verifies a user's email by finding the user with the given verification token, updating
 * their verification status, and sending a success message.
 */
const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: null });

  res.status(200).json({ message: "Verification successful" });
};

/**
 * The function `resendVerifyEmail` sends a verification email to a user's email address if they have
 * not already passed the verification process.
 */
const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new HttpError(400, "Missing required field email");
  }

  if (user.verify) {
    throw new HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(200).json({ message: "Verification email sent" });
};

/**
 * The login function checks if the email and password provided by the user match an existing user in
 * the database, and if so, generates a JSON Web Token (JWT) and updates the user's token field in the
 * database.
 */
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new HttpError(401, "Email or password is wrong");
  }

  if (!user.verify) {
    throw new HttpError(401, "Email not verified");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw new HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({ token });
};

/**
 * The getCurrent function retrieves the email and subscription information of the current user and
 * sends it as a JSON response.
 */
const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.json({ email, subscription });
};

/**
 * The `logout` function updates the `token` field of the user with the given `_id` to `null` and
 * returns a response with a status code of 204 and a message of "No Content".
 */
const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });

  res.status(204).json({ message: "No Content" });
};

/**
 * The function updates the avatar of a user by renaming and moving the uploaded file, updating the
 * avatar URL in the user's document, and returning the new avatar URL.
 */
const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;

  const resultUpload = path.join(avatarDir, filename);

  const image = await Jimp.read(tempUpload);
  await image.resize(250, 250).write(tempUpload);

  await fs.rename(tempUpload, resultUpload);

  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.status(200).json({ avatarURL });
};

module.exports = {
  register: controllerWrapper(register),
  verifyEmail: controllerWrapper(verifyEmail),
  resendVerifyEmail: controllerWrapper(resendVerifyEmail),
  login: controllerWrapper(login),
  getCurrent: controllerWrapper(getCurrent),
  logout: controllerWrapper(logout),
  updateAvatar: controllerWrapper(updateAvatar),
};
