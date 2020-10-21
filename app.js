//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const { ppid } = require('process');
const encrypt = require('mongoose-encryption');

const app = express();

console.log(process.env.SECRET);

const secret = process.env.SECRET;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String

});

userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = mongoose.model('User', userSchema);

const user = new User({
})

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register', async (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password

    })
    try {
        await newUser.save();
        res.status(200).render('secrets');
    } catch (e) {
        res.status(400).send(e);
    }

})

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;


    try {
        const foundUser = await User.findOne({ email: username });
        if (!foundUser) {
            res.status(404).send();
        }
        else {
            if (foundUser.password === password) {
                res.status(200).render('secrets');
            }
        }
    } catch (e) {
        res.status(500).send();
    }
})

app.listen(3000, () => {
    console.log('Listening on port 3000');
})
