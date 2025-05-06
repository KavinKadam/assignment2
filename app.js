require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up templating, form parsing, and static file support
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ✅ CRITICAL: Configure sessions BEFORE loading routes
app.use(session({
    secret: process.env.NODE_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 60 * 60 // 1 hour
    })
}));

// Load routes AFTER session middleware is active
const authRoutes = require('./routes/auth');
const membersRoutes = require('./routes/members');
app.use('/', authRoutes);
app.use('/', membersRoutes);

// 404 fallback
app.use((req, res) => {
    res.status(404).render('404');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));