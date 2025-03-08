const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post('/register', async (req, res) => {
  try{
    const {username, email, password} = req.body;
    const user = new User({username, email});
    const registerdUser = await User.register(user, password);
    console.log(registerdUser);
    req.flash('success', 'Yelp Campへようこそ！');
    res.redirect('/campgrounds');
  }catch(e){
    req.flash('error', e.message);
    res.redirect('/register');
  }
});

module.exports = router;