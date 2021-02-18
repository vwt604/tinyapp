//*NOTE 1) Reroute Edit button on /urls page 2) Fix /u/

//------------  SET UP  ------------//

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');


app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(cookieParser());

app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}!`);
});


// ******** ---------  CODE --------- ******** // 


function generateRandomString() {
  return Math.random().toString(16).substring(2, 8);
}


function checkExistingEmail(email) {
  for (var userID in users) {
    if(users[userID].email === email) return true
  }
  return false
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

// GET / 

app.get("/", (req, res) => {
  res.send("Hello!");
});


// GET /urls.json

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase)
})

// GET /hello

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});




//------------  /urls  ------------//


//GET /urls   :: Renders urls_index.ejs page

app.get("/urls", (req, res) => {   
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};   //shortcut to look inside the views directory for any template files
  res.render("urls_index", templateVars);
});


//POST /urls    :: Generates a random string, saves the string to the urlDatabase with longURL as value, then rediects to "/urls/:shortURL/"     
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  // console.log(req.body);  // Log the POST request body to the console. Note this has been parsed already
  // console.log( { shortURL: generateRandomString() });  //revise this to put in an object 
  urlDatabase[shortURL] = req.body.longURL
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);         
});


//POST /urls/login  :: Sets a cookie named username then redirects to "/urls"

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  // console.log(req.body);     
  res.redirect(`/urls`);    
});


//POST /urls/logout  :: Deletes username cookie then redirects to "/urls"

app.post("/logout", (req, res) => {
  const username = req.body.username;
  res.clearCookie('username', username);
  // console.log(req.body);     
  res.redirect(`/urls`);    
});



//------------  /urls/new  ------------//


//GET: /urls/new    :: Renders page with urls_new.ejs

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]}; 
  res.render("urls_new", templateVars);
});


//------------  /urls/:shortURL  ------------//


// GET /urls/:shortURL    :: Renders with urls_show.ejs

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars)
});


//POST /urls/:shortURL/   :: Edits the longURL, then redirects to "/urls"

app.post("/urls/:shortURL/", (req, res) => {
  // console.log(req.body);
  urlDatabase[req.params.shortURL] = req.body.newURL;
  res.redirect(`/urls`);        
});



//POST /urls/:shortURL/delete   :: Deletes shortURL from database, then redirects to "/urls"


app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  // console.log(urlDatabase);
  res.redirect(`/urls`);         
});



//GET /u/:shortURL  :: Clickable link on the page displayed as shortURL. Redirects to longURL when clicked

app.get("/u/:shortURL", (req, res) => {
  //console.log(req.params.shortURL);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});



//------------  /register  ------------//


//GET /register     :: renders register.ejs template
app.get("/register", (req, res) => {
  const templateVars = {username: req.cookies["username"]}; 
  res.render("register", templateVars)
});



//POST /register    :: adds new user object to global users object

app.post("/register", (req, res) => {

  res.cookie("email", req.body.email);
  res.cookie("password", req.body.password);

  const userID = generateRandomString();
  const newUser = {
    "id": userID,
    "email": req.body.email,
    "password": req.body.password
  }

  if(!newUser.email || !newUser.password) {
    res.status(400).render('400'); //TODO: update 400 page
  } else if (checkExistingEmail(req.body.email)) {
    res.status(400).render('400'); //TODO: update 400 page
  } else {
    users[userID] = newUser;
    res.cookie('userID', userID)
    res.redirect(`/urls`); 
  }

});

// app.post("/register", (req, res) => {

//   res.cookie("email", req.body.email);
//   res.cookie("password", req.body.password);

//   const userID = generateRandomString();
//   const newUser = {
//     "id": userID,
//     "email": req.cookies.email,
//     "password": req.cookies.password
//   }

//   users[userID] = newUser;
//   res.redirect(`/urls`);    
// });


//------------  /login  ------------//


app.get("/login", (req, res) => {
  const templateVars = {username: req.cookies["username"]}; 
  res.render("login", templateVars)
});


app.post("/register", (req, res) => {
  req.body.name
});