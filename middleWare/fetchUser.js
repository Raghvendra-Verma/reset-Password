const jwt = require("jsonwebtoken");

const fetchUser = async (req, res, next) => {
    const token = req.header("authToken");

    if (!token) {
        return res.status(401).send("User not Found");
    }
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send(e);
    }
}

module.exports = fetchUser;