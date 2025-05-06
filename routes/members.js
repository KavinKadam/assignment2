const express = require('express');
const router = express.Router();
const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];

router.get('/members', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    const randomImage = images[Math.floor(Math.random() * images.length)];
    res.render('members', { name: req.session.user.name, image: `/images/${randomImage}` });
});

module.exports = router;