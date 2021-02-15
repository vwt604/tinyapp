const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

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

app.get("/urls", (req, res) => {    //
  const templateVars = { urls: urlDatabase };   //look inside the views directory for any template files
  res.render("urls_index", templateVars);
});