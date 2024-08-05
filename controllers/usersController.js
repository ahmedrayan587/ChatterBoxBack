import User from "../model/userModel.js";
import bcrypt from "bcrypt";

export async function register(req, res, next) {
  try {
    /*image should sent as a string in base64 */
    const { image, username, email, password } = req.body;

    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: 400 });

    const emailCheck = await User.findOne({ email });
    if (emailCheck) return res.json({ msg: "Email already used", status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      image,
      email,
      username,
      password: hashedPassword,
    });

    // Remove the password from the response object
    user.password = undefined;

    return res.json({ status: 200, user });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user)
      return res.json({ msg: "Incorrect username or password", status: 400 });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect username or password", status: 400 });
    user.password = undefined;
    return res.json({ status: 200, user });
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const userId = req.params.id;

    // Fetch all users excluding the current user
    const users = await User.find({ _id: { $ne: userId } }).select([
      "_id",
      "image",
      "username",
      "email",
      "lastChat",
    ]);

    // Sort users based on the last chat timestamp
    users.sort((a, b) => {
      const aLastChat = a.lastChat ? a.lastChat.get(userId) : null;
      const bLastChat = b.lastChat ? b.lastChat.get(userId) : null;

      // Convert timestamps to numbers (or use a default value if null)
      return (bLastChat || 0) - (aLastChat || 0);
    });

    return res.json({ status: 200, users });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id }).select([
      "_id",
      "image",
      "username",
      "email",
      "lastChat",
    ]);
    return res.json({ status: 200, user });
  } catch (error) {
    next(error);
  }
}
