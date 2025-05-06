// Let's get all the requires out of the way

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

// Express App that I will deploy on port 3k
const app = express();
const PORT = process.env.PORT || 3000;

// Reaching into the routes folder
const authRoutes = require('./routes/auth');
const membersRoutes = require('./routes/members');

// Setting deepest possible nesting, static files, using ejs for my html.
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes from the respective folders earlier
app.use('/', authRoutes);
app.use('/', membersRoutes);

// Returning a 404 if any other url is entered, unrecognized etc
app.use((req, res) => {
    res.status(404).render('404');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));