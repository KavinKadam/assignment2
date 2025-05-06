const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { MongoClient } = require('mongodb');

const router = express.Router();
let db;
MongoClient.connect(process.env.MONGODB_URI)
    .then(client => db = client.db())
    .catch(err => console.error(err));

router.get('/', (req, res) => {
    if (req.session.user) {
        res.render('home', { name: req.session.user.name });
    } else {
        res.render('home', { name: null });
    }
});

router.get('/signup', (req, res) => res.render('signup'));
router.post('/signup', async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.send('Missing fields. <a href="/signup">Try again</a>');

    const hash = await bcrypt.hash(req.body.password, 10);
    const user = { name: req.body.name, email: req.body.email, password: hash };

    try {
        await db.collection('users').insertOne(user);
        req.session.user = { name: user.name };
        res.redirect('/members');
    } catch {
        res.send('Error creating user. <a href="/signup">Try again</a>');
    }
});

router.get('/login', (req, res) => res.render('login'));
router.post('/login', async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.send('Invalid input. <a href="/login">Try again</a>');

    const user = await db.collection('users').findOne({ email: req.body.email });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
        req.session.user = { name: user.name };
        res.redirect('/members');
    } else {
        res.send('Invalid login. <a href="/login">Try again</a>');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;