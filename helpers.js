const generateRandomString = function() {
  return Math.random().toString(16).substring(2, 8);
}


const checkExistingEmail = function(email) {
  for (var key in users) {
    if(users[key].email === email) 
    return true;
  }
  return false;
};

const getUserbyEmail = function(email, database) {
  for (var key in database) {
    if(database[key].email === email) 
    return database[key].id;
  }
};

const urlsForUser = function(id, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  } 
  return userUrls;
};


module.exports = {
  generateRandomString,
  checkExistingEmail,
  getUserbyEmail,
  urlsForUser,
};

