const express = require('express');
const router = express.Router();
const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];

// Snends you to the members section if you are a valid/signed up user
router.get('/members', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    const imgPaths = images.map(img => `/images/${img}`);
    res.render('members', { name: req.session.user.name, images: imgPaths });
});

module.exports = router;