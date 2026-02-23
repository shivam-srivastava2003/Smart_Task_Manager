const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const ExpressError = require('./utils/ExpressError');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');

const app = express();
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/smart-task-manager';

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log('Mongo connection open');
  })
  .catch((err) => {
    console.error('Mongo connection error:', err.message);
    console.warn('App will still boot, but DB-backed routes will fail until MongoDB is available.');
  });

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'smarttaskmanagersecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.validationErrors = req.flash('validationErrors');
  next();
});

app.get('/', (req, res) => {
  res.render('landing');
});

app.use('/', userRoutes);
app.use('/dashboard', taskRoutes);
app.use('/tasks', (req, res) => res.redirect(`/dashboard${req.url === '/' ? '' : req.url}`));

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Something went wrong!' } = err;
  if (!res.locals.error || res.locals.error.length === 0) {
    req.flash('error', message);
  }
  res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
