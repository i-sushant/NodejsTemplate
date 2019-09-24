const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const passport = require('passport');

const uploadRoute = require('./routes/upload');
const authRoute = require('./routes/auth')
const mongoose = require("mongoose");
const db = require("./config/keys").mongoURI;

mongoose
    .connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("mongoDB connected"))
    .catch(err => console.log("mongoDB did not connected", err));


app.use(passport.initialize());
require("./config/passport")(passport);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use('/api/media', uploadRoute);
app.use('/auth', authRoute);


app.get('/', (req,res) => {
    res.send({'message':'This is the home page'});
});

app.listen(3000, process.env.IP, () => {
    console.log("Server started");
})