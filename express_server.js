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

function generateRandomString() {
  return Math.random().toString(16).substring(2, 8);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//GET /urls

app.get("/urls", (req, res) => {    //will render the page with the urls_new EJS template
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};   //shortcut to look inside the views directory for any template files
  res.render("urls_index", templateVars);
});



//POST: /urls
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  // console.log(req.body);  // Log the POST request body to the console. Note this has been parsed already
  // console.log( { shortURL: generateRandomString() });  //revise this to put in an object 
  urlDatabase[shortURL] = req.body.longURL
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);         
});



//GET: /urls/new. will render the page with the urls_new EJS template

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


// GET /urls/:shortURL

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars)
});



//GET /u/:shortURL

app.get("/u/:shortURL", (req, res) => {
//console.log(req.params.shortURL);
const longURL = urlDatabase[req.params.shortURL];
res.redirect(longURL);
});


//POST /urls/:shortURL/delete


app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  console.log(urlDatabase);
  res.redirect(`/urls`);         
});


//POST /urls/:shortURL/  modify the corresponding longURL, and then redirect the client back to "/urls".

app.post("/urls/:shortURL/", (req, res) => {
  // console.log(req.body);
  urlDatabase[req.params.shortURL] = req.body.newURL;
  res.redirect(`/urls`);        
});

//POST /urls/login   set a cookie named username to the value submitted in the request body via the login form then redirects to "/urls"

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  // console.log(req.body);     
  res.redirect(`/urls`);    
});



// const templateVars = {
//   username: req.cookies["username"],
//   // ... any other vars
// };
// res.render("urls_index", templateVars);