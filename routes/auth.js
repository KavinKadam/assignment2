const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { MongoClient } = require('mongodb');

const router = express.Router();
let db;

// Mongo connection
MongoClient.connect(process.env.MONGODB_URI)
    .then(client => db = client.db())
    .catch(err => console.error(err));

// Home route
router.get('/', (req, res) => {
    if (req.session.user) {
        res.render('home', {
            name: req.session.user.name,
            user_type: req.session.user.user_type
        });
    } else {
        res.render('home', { name: null, user_type: null });
    }
});

// Signup GET
router.get('/signup', (req, res) => {
    res.render('signup', { error: null });
});

// Signup POST
router.post('/signup', async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.render('signup', { error: 'All fields are required.' });

    const existing = await db.collection('users').findOne({ email: req.body.email });
    if (existing) return res.render('signup', { error: 'Email already registered.' });

    const hash = await bcrypt.hash(req.body.password, 10);

    const user = {
        name: req.body.name,
        email: req.body.email,
        password: hash,
        user_type: "user"
    };

    try {
        await db.collection('users').insertOne(user);
        req.session.user = {
            name: user.name,
            user_type: user.user_type
        };
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('signup', { error: 'Error creating user. Try again.' });
    }
});

// Login GET
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Login POST
router.post('/login', async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.render('login', { error: 'Invalid input.' });

    const user = await db.collection('users').findOne({ email: req.body.email });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
        req.session.user = {
            name: user.name,
            user_type: user.user_type
        };
        res.redirect('/');
    } else {
        res.render('login', { error: 'Invalid login credentials.' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;