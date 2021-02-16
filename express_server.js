const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');

app.set('view engine', 'ejs');
app.use(morgan('dev'));

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
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

//POST request: This needs to come before all of our routes
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  // console.log(req.body);  // Log the POST request body to the console. Note this has been parsed already
  // console.log( { shortURL: generateRandomString() });  //revise this to put in an object 
  urlDatabase[shortURL] = req.body.longURL
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);         
});


//GET: /urls/new. This route handler will render the page with the form (urls_new). Placed before ID. 

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//GET /urls

app.get("/urls", (req, res) => {    //
  const templateVars = { urls: urlDatabase };   //shortcut to look inside the views directory for any template files
  res.render("urls_index", templateVars);
});


// GET /urls/:shortURL

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
  res.render("urls_show", templateVars)
});


//GET /u/:shortURL

app.get("/u/:shortURL", (req, res) => {
//console.log(req.params.shortURL);
const longURL = urlDatabase[req.params.shortURL];
res.redirect(longURL);
});


