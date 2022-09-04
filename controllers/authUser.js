require("dotenv").config()
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const Token = require("../models/token");
const crypto = require("crypto");
const sendEmail = require("../Utils/Emails/sendEmail");

const register = async (req, res, next) => {
    try {
        const foundUser = await User.findOne({ email: req.body.email });
        if (foundUser) {
            return res.status(400).send({ message: "User already exists" });
        }
        const hashPassword = await argon2.hash(req.body.password);
        const data = {
            name: req.body.name,
            email: req.body.email,
            password: hashPassword
        }
        console.log(data);

        const newUser = await new User(data);
        newUser.save();

        const newData = {
            user: {
                id: newUser.id
            }
        }
        const authToken = jwt.sign(newData, process.env.JWT_SECRET)

        res.status(200).send({
            userId: newUser.id,
            email: newUser.email,
            name: newUser.name,
            token: authToken,
        });
    } catch (e) {
        res.status(500).send({ message: e.message });
    }
}

const login = async (req, res, next) => {
    try {
        const foundUser = await User.findOne({ email: req.body.email });
        if (!foundUser) {
            return res.status(404).send({ message: "User not found" });
        }

        if (!(await argon2.verify(foundUser.password, req.body.password))) {
            return res.status(400).send({ message: "Wrong credentials , Please try again" })
        }

        const newData = {
            user: {
                id: foundUser.id
            }
        }
        const authToken = jwt.sign(newData, process.env.JWT_SECRET)
        res.status(200).send({ authToken: "Authorization " + authToken });
    } catch (e) {
        res.status(500).send({ message: e.message });
    }
}

const requestPasswordReset = async (req, res, next) => {

    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).send({ message: "User does not exist" });
    }

    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();

    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await argon2.hash(resetToken);

    await new Token({
        userId: user._id,
        token: hash,
        createdAt: Date.now(),
    }).save();

    const link = `https://localhost:3000/passwordReset?token=${resetToken}&id=${user._id}`;
    sendEmail(user.email, "Password Reset Request", { name: user.name, link: link, }, "./template/requestResetPassword.hbs");
    res.status(200).json(link);
};

const resetPassword = async (req, res, next) => {

    const userId = req.body.userId;
    const token = req.body.token;
    const password = req.body.password;
    let passwordResetToken = await Token.findOne({ userId });
    if (!passwordResetToken) {
        return res.status(404).send({ message: "Invalid or expired password reset token" });
    }
    const isValid = await argon2.verify(passwordResetToken.token, token);
    if (!isValid) {
        return res.status(404).send({ message: "Invalid or expired password reset token" });
    }
    const hash = await argon2.hash(password);
    await User.updateOne(
        { _id: userId },
        { $set: { password: hash } },
        { new: true }
    );
    const user = await User.findById({ _id: userId });
    sendEmail(
        user.email,
        "Password Reset Successfully",
        {
            name: user.name,
        },
        "./template/resetPassword.hbs"
    );
    await passwordResetToken.deleteOne();
    res.status(200).send({message: "Password Reset Successfully"});
};

module.exports = {
    register,
    login,
    requestPasswordReset,
    resetPassword
}