const express = require("express");
const app = express();
const mongoose = require("mongoose");
const authUser =  require("./routes/user");
const cors = require("cors")

app.use(express.json({extended: true}));

mongoose.connect("mongodb://127.0.0.1:27017/ttchannel",
 {
    useNewUrlParser: true
},
 ()=> {
    console.log("Database connected");
})
const port = 3000;

app.get("/" , (req,res) => {
    res.send("<h1>This is my home page</h1>");
});


app.use("/api/auth", authUser);
app.use(cors());


app.listen(port , () => {
    console.log(`listening to the port ${port}`);
});

module.exports = app;