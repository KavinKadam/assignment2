const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

const router = express.Router();
let db;

// Connects using .env material.
MongoClient.connect(process.env.MONGODB_URI)
    .then(client => db = client.db())
    .catch(err => console.error(err));

// Returns a 403 if an inauthenticated user uses the url to access the admin page.
router.get('/admin', isAuthenticated, async (req, res) => {
    if (req.session.user.user_type !== 'admin') {
        return res.status(403).render('403', { name: req.session.user.name });
    }

    const users = await db.collection('users').find().toArray();
    res.render('admin', { name: req.session.user.name, users });
});

// Allows promotion of another user
router.get('/promote/:id', isAuthenticated, isAdmin, async (req, res) => {
    await db.collection('users').updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { user_type: 'admin' } }
    );
    res.redirect('/admin');
});

// allows demotion of another user
router.get('/demote/:id', isAuthenticated, isAdmin, async (req, res) => {
    await db.collection('users').updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { user_type: 'user' } }
    );
    res.redirect('/admin');
});

module.exports = router;