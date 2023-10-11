const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/users");
const { HttpError, controllerWrapper } = require("../utils");

const { SECRET_KEY } = process.env;

/**
 * The function registers a new user by checking if the email is already in use, hashing the password,
 * creating a new user with the hashed password, and returning the user's email and subscription in the
 * response.
 */
const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({ ...req.body, password: hashPassword });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
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
    throw HttpError(401, "Email or password is wrong");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
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

module.exports = {
  register: controllerWrapper(register),
  login: controllerWrapper(login),
  getCurrent: controllerWrapper(getCurrent),
  logout: controllerWrapper(logout),
};
