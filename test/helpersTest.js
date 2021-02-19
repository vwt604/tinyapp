const { assert } = require('chai');

const { generateRandomString, checkExistingEmail, getUserbyEmail, urlsForUser } = require("../helpers")


const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "no-more-funk"
  }
};

const testUrlDatabase= {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" }
};


describe('generateRandomString', function() {

  it('should return a string with six characters', function() {
    const randomStringLength = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(randomStringLength, expectedOutput);
  });

  it('should return a different string each time it is called', function() {
    const firstRandomString = generateRandomString();
    const secondRandomString = generateRandomString();
    assert.notEqual(firstRandomString, secondRandomString);
  });
});

describe('checkExistingEmail', function() {
  
  it('should return true if email is in the database', function() {
    const existingEmail = checkExistingEmail("user@example.com", testUsers);
    const expectedOutput = true;
    assert.equal(existingEmail, expectedOutput);
  });

  it('should return false if email does not exist in the database', function() {
    const nonExistingEmail = checkExistingEmail("nobueno@nowhere.com", testUsers);
    const expectedOutput = false;
    assert.equal(nonExistingEmail, expectedOutput);
  });
});


describe('getUserbyEmail', function() {
  it('should return a users ID with the provided email', function() {
    const user = getUserbyEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it('should return undefined when no user exists for a given email address', function() {
    const user = getUserbyEmail("me@test.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});


describe('urlsForUser', function() {

  it('should return an object of url information specific to the given user ID', function() {
    const specificUrls = urlsForUser("userRandomID", testUrlDatabase);
    const expectedOutput = {
      "b6UTxQ": {
        longURL: "https://www.tsn.ca",
        userID: "userRandomID"
      },
      "i3BoGr": {
        longURL: "https://www.google.ca",
        userID: "userRandomID"
      }
    };
    assert.deepEqual(specificUrls, expectedOutput);
  });

  it('should return an empty object if no urls exist for a given user ID', function() {
    const noSpecificUrls = urlsForUser("fakeUser", testUrlDatabase);
    const expectedOutput = {};
    assert.deepEqual(noSpecificUrls, expectedOutput);
  });
});