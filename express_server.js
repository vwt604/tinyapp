const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

const { generateRandomString, checkExistingEmail, getUserbyEmail, urlsForUser } = require("./helpers");

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'TinyURL',
  keys: ['secret things', 'more secret things']
}));
app.use(express.static(__dirname + '/public'));


const urlDatabase = {};

const users = {};


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Index redirects to My URLs page
app.get("/", (req, res) => {
  res.redirect(`/urls`)
});

// Gets My TinyURLs page
app.get("/urls", (req, res) => {
  const filteredUrls = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = {
    urls: filteredUrls,
    user: users[req.session.user_id],
  };
  res.render('urls_index', templateVars);
});

// Gets Create TinyURL page
app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  res.render("urls_new", templateVars); 
});

// Gets page after TinyURL is created
app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send("This TinyURL does not exist.");
  }
  if (!req.session.user_id) {
    res.redirect(`/urls/`);
  }
  const url = urlDatabase[req.params.shortURL];
  if (url.userID === req.session.user_id) {
    const templateVars = {
      longURL: urlDatabase[req.params.shortURL]['longURL'],
      shortURL: req.params.shortURL,
      user: users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("Sorry, you don't have access to this TinyURL.");
  }
});

// Gets a TinyURL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.status(404).send("Sorry, we could not find this TinyURL.");
  }
});

// Gets registration page
app.get("/register", (req, res) => {
  if (!req.session.user_id) {
    const templateVars = {user: users[req.session.user_id]};
    res.render("register", templateVars);
  } else {
    res.redirect(`/urls`);
  }
});

// Gets login page
app.get("/login", (req, res) => {
  if (!req.session.user_id) {
    const templateVars = {user: users[req.session.user_id]};
    res.render("login", templateVars);
  } else {
    res.redirect(`/urls`);
  }
});

// Registers a new user and validates form info
app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send('Please enter a valid email and password');
  } else if (checkExistingEmail(req.body.email, users)) {
    res.status(400).send('This email is already in use. Please login or register with another email.');
  } else {
    const newUser = {
      "id": user_id,
      "email": email,
      "password": bcrypt.hashSync(password, 10)
    };
    users[user_id] = newUser;
    req.session.user_id = user_id;
    res.redirect(`/urls`);
  }
});

// Verifies login information
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserbyEmail(email, users);
  if (!user) {
    res.status(403).send('This account does not exist');
  } else if (bcrypt.compareSync(password, users[user].password)) {
    req.session.user_id = users[user].id;
    res.redirect(`/urls`);
  } else {
    res.status(403).send('Incorrect password');
  }
});

// Deletes cookies upon logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});


// Posts new TinyURL to database
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.redirect(`/urls/`);
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

// Edits TinyURL in database if user is the URL owner
app.post("/urls/:shortURL/", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    urlDatabase[req.params.shortURL] = { longURL: req.body.newURL, userID: req.session.user_id };
    res.redirect(`/urls`);
  } else {
    res.status(403).send("Sorry, you don't have access to this TinyURL.");
  }
});


// Deletes TinyURL from database if the user is the URL owner
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(403).send("Sorry, you don't have access to this TinyURL.");
  }
});


app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}!`);
});