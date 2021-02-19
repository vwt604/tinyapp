//------------********  IMPORTS  *******------------//

const express = require("express");
const app = express();
const PORT = 8080; 
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');


//------------********  MIDDLEWARE  *******------------//

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'joey',
  keys: ['secret things', 'more secret things']
}));

app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}!`);
});


//------------********  HELPERS *******------------//


const { generateRandomString, checkExistingEmail, getUserbyEmail, urlsForUser } = require("./helpers");


//------------******** DATABASES *******------------//

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "joey@friends.com",
    password: bcrypt.hashSync('123', 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "phoebe@friends.com",
    password: bcrypt.hashSync('moo', 10)
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "monica@meow.ca",
    password: bcrypt.hashSync('meow', 10)
  }
};


//------------********  ROUTES  *******------------//

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect(`/login`);
  } else {
    res.redirect(`/urls`);
  }
})


app.get("/urls", (req, res) => {
  const filteredUrls = urlsForUser(req.session.user_id, urlDatabase);
  let templateVars = {
    urls: filteredUrls,
    user: users[req.session.user_id],
  };
  res.render('urls_index', templateVars);
});


app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});


app.get("/urls/:shortURL", (req, res) => {
  if(urlDatabase[req.params.shortURL]) {
    if (!req.session.user_id) {
      res.status(400).send("Please login to use TinyApp's features.");
    } else {
      const url = urlDatabase[req.params.shortURL];
      if (url.userID === req.session.user_id) {
        const templateVars = {
          longURL: urlDatabase[req.params.shortURL]['longURL'],
          shortURL: req.params.shortURL,
          user: users[req.session.user_id],
        };
        res.render("urls_show", templateVars);
      } else {
        res.status(400).send("Oops. This TinyURL is already taken. Please create a new one.");
      }
    }
  } else {
    res.status(404).send("This TinyURL does not exist.");
  }
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    res.send(404).send("This URL does not exist");
  } else {
    res.redirect(longURL);
  }
});


app.get("/register", (req, res) => {
  if (!req.session.user_id) {
    const templateVars = {user: users[req.session.user_id]};
    res.render("register", templateVars);
  } else {
    res.redirect(`/urls`)
  }
});


app.get("/login", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  res.render("login", templateVars);
});


app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    "user_id": user_id,
    "email": email,
    "password": hashedPassword
  };
  if (!newUser.email || !newUser.password) {  //if false email or password, return error message
    res.status(400).send('Please enter a valid email and password');
  } else if (checkExistingEmail(req.body.email, users)) {
    res.status(400).send('This email is already in use. Please login or register with another email'); //
  } else {
    users[user_id] = newUser;
    req.session.user_id = user_id;
    res.redirect(`/urls`);
  }
});


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


app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect(`/urls`);
});


app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(400).send("Please login to use TinyApp's features.");
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${shortURL}`);
  }
});


app.post("/urls/:shortURL/", (req, res) => {
  urlDatabase[req.params.shortURL] = { longURL: req.body.newURL, userID: req.session.user_id };
  res.redirect(`/urls`);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});