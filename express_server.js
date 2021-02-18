/*NOTES

[x] only logged in users can create urls
[x] redirect someone not logged in to login page
[] add userID key to object  
[x] use userID key to track which URLs belong to which user 
[x] anyone can visit /u/:id (even when not logged in)
[] fix problem: new urls not posting to /urls...something with getUsersUrl function...
[] bug: new URLS not posting to database


*/

//------------********  SET UP  *******------------//

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');


app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cookieSession({
  name: 'w3d4-lecture',
  keys: ['secret things', 'more secret things', 'chicken']
}));

app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}!`);
});


//------------********  FUNCTIONS  *******------------//


function generateRandomString() {
  return Math.random().toString(16).substring(2, 8);
}


function checkExistingEmail(email) {
  for (var key in users) {
    if(users[key].email === email) 
    return true;
  }
  return false;
};

function getUserbyEmail(email) {
  for (var key in users) {
    if(users[key].email === email) 
    return users[key];
  }
};

const urlsForUser = function(id) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  } 
  return userUrls;
};



//------------******** DATABASE *******------------//

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "user"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID", 
    email: "meow@meow.ca", 
    password: "meow"
  }
}




//------------********  ROUTES  *******------------//


// GET / 

app.get("/", (req, res) => {
  res.send("Hello!");
});


// // // GET /urls.json

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase)
})

// GET /hello

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});




//------------  /urls  ------------//


//GET /urls   :: Renders urls_index.ejs page. Only logged-in users have access

app.get("/urls", (req, res) => {
  const filteredUrls = urlsForUser(req.cookies["user_id"]); //filters so user can only see their own urls
  let templateVars = {
    urls: filteredUrls,  
    user: users[req.cookies["user_id"]], //aka userRandomID
  };
  res.render('urls_index', templateVars);
});



//POST /urls    :: Saves new url to urlDatabase
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {        
    longURL: req.body.longURL,
    userID: req.cookies["user_id"],  //aka userRandomID
  };
  // console.log(urlDatabase)
  res.redirect(`/urls/${shortURL}`);
});


//POST /urls/logout  :: Deletes username cookie then redirects to "/urls"

app.post("/logout", (req, res) => {
  const user_id = req.body.user_id;
  res.clearCookie('user_id', user_id);
  // console.log(req.body);     
  res.redirect(`/urls`);    
});



//------------  /urls/new  ------------//


//GET: /urls/new    :: Renders page with urls_new.ejs. Only logged-in users have access

app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
  
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});


//------------  /urls/:shortURL  ------------//


/* GET /urls/:shortURL    

Only logged-in users have access.
If url belongs to user, user can edit
If url doesn't belong to user, user is redirected to /urls

*/

app.get("/urls/:shortURL", (req, res) => {
  if(!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {
    const user = urlsForUser(req.cookies['user_id'])  
    if (Object.keys(users).includes(req.params.shortURL)){
      const templateVars = {
        longURL: urlDatabase[req.params.shortURL]['longURL'],
        user: users[req.cookies["user_id"]],
      };
    res.render("urls_show", templateVars)
    } else {
      res.redirect("/urls")
    }
  }
});


//POST /urls/:shortURL/   :: Edits the longURL, then redirects to "/urls"

app.post("/urls/:shortURL/", (req, res) => {
  // console.log(req.body);
  urlDatabase[req.params.shortURL] = { longURL: req.body.newURL, userID: req.cookies["user_id"] };

  res.redirect(`/urls`);        
});

// b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },


//POST /urls/:shortURL/delete   :: Deletes shortURL from database, then redirects to "/urls"


app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  // console.log(urlDatabase);
  res.redirect(`/urls`);         
});



//GET /u/:shortURL  :: Clickable link on the page displayed as shortURL. Redirects to longURL when clicked

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    res.send(302);
  } else {
    res.redirect(longURL);
  }
});




//------------  /register  ------------//


//GET /register     :: renders register.ejs template
app.get("/register", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]}; 
  res.render("register", templateVars)
});



//POST /register    :: adds new user object to global users object

app.post("/register", (req, res) => {

  res.cookie("email", req.body.email);
  res.cookie("password", req.body.password);

  const user_id = generateRandomString();
  const newUser = {
    "user_id": user_id,
    "email": req.body.email,
    "password": req.body.password
  }

  if(!newUser.email || !newUser.password) {
    res.status(400).send('Please enter valid email and password'); 
  } else if (checkExistingEmail(req.body.email)) {
    res.status(400).send('Email already used'); //TODO: update 400 page or change to message?
  } else {
    users[user_id] = newUser;
    res.cookie('user_id', user_id)
    res.redirect(`/urls`); 
  }

});


//------------  /login  ------------//


app.get("/login", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]}; 
  res.render("login", templateVars)
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  const user = getUserbyEmail(email)
  // console.log('email', email)
  if(!user) {
    res.status(403).send('This account does not exsist'); 
  } else if (user.password !== password) {
    res.status(403).send('Incorrect password'); //TODO: update 400 page or change to message?
  } else {
    res.cookie('user_id', user.id)
    res.redirect(`/urls`); 
  }
});


