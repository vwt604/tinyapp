/* TO DO 

[x] POST to /urls/:id/ : remove access from non-owner
[x] POST /urls/:id/delete : remove access from non-owner
[x] GET /urls/id change message to "You don't own this link"
[] GET /u/:id crashes TypeError: Cannot read property 'longURL' of undefined" error.
[x] POST /registration : users can registter without password : There should be a check to make sure that they don't register with just email and no password.

[x] Add .DS_Store to gitignore
[x] Remove cookie-parser from package.json
[] Clean up console logs
[] Add comments for complex routes
[x] Replace vars with const/let 
[] Semicolons 
[] Remove sample databases

*/

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


const urlDatabase = {
  i3fewr: { longURL: "https://www.google.ca", userID: "userRandomID" },
  b6UTxQ: { longURL: "https://www.pizza.ca", userID: "userRandomID" },
  v38djr: { longURL: "https://www.facebook.com", userID: "userRandomID" },
  c7wham: { longURL: "https://www.youtube.com", userID: "userRandomID" },
  xshdn2: { longURL: "https://www.lighthouselabs.com", userID: "user2RandomID" },
  j8ksbs: { longURL: "https://www.codecademy.com", userID: "user2RandomID" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "joey@friends.com",
    password: bcrypt.hashSync('how-u-doin', 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "phoebe@friends.com",
    password: bcrypt.hashSync('smelly-cat', 10)
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "chandler@friends.com",
    password: bcrypt.hashSync('whats-my-job', 10)
  }
};


//------------********  ROUTES: GET  *******------------//

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
  const templateVars = {
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
      res.redirect(`/urls/`);
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
        res.status(400).send("Sorry, you don't have access to this TinyURL.");
      }
    }
  } else {
    res.status(404).send("This TinyURL does not exist.");
  }
});


app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("This TinyURL is broken. Please create a new one.");
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

  if (!req.session.user_id) {
    const templateVars = {user: users[req.session.user_id]};
    res.render("login", templateVars);
  } else {
    res.redirect(`/urls`)
  }  
});

app.get("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    res.redirect(`/urls/`);
  } else {
    res.redirect(`/urls`)
  }  
});


//------------********  ROUTES: POST *******------------//

/* 
New user is generated and assigned a unique ID if:
  1) user enters a valid email and password, and 
  2) the email is not taken by another user
Relevant error message is sent if otherwise. 
*/ 

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
    }
    users[user_id] = newUser;
    req.session.user_id = user_id;
    res.redirect(`/urls`);
  }
});


//Checks if user exists by provided email then validates password.
//Relevant error message is sent if email or password are invalid. 

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


//Cookies are deleted upon logout 
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});


//New URL is created and posted to urlDatabase
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

//Edits URL if user is the URL owner
app.post("/urls/:shortURL/", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    urlDatabase[req.params.shortURL] = { longURL: req.body.newURL, userID: req.session.user_id };
    res.redirect(`/urls`);
  } else {
    res.status(401).send("Sorry, you don't have access to this TinyURL.");
  }
});


//Deletes URL from database if the user is the URL owner
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(401).send("Sorry, you don't have access to this TinyURL.");
  }
});


app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}!`);
});