
const bcrypt = require('bcryptjs');

//lecture 

const plainpass = '1234'

bcrypt.compare('1234', hash(err, res) => {
  console.log(res)
})

bcrypt.compare('1234', hash)
  .then(res) => {
    console.log('promise result', res)
  }

//compare passwords

bcrypt.compare(password, user.password, (err, result) => {
  if(result) {
    res.cookie('username', user.username);
    res.redirect('/protected');
  } else {
    return res.status(401).send('Password incorrect')
  })
}