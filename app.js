const express = require('express');
const app = express();
const ejsMate = require('ejs-mate');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const { descriptors } = require('./seeds/seedHelpers');
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/review');

mongoose.connect('mongodb://localhost:27017/yelp-camp',
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => {
    console.log('MongoDBコネクションOK!');
  })
  .catch(err => {
    console.log('コネクションエラー！');
    console.log(err);
  })

const sessionConfig = {
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7日間
  }
}

/* ミドルウェア */
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sessionConfig));


/* ホーム画面 */
app.get('/', (req, res) => {
  res.render('home');
});

/* Routes */
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes)

/* ページが見つかりませんでした */
app.all('*', (req, res, next) => {
  next(new ExpressError('ページが見つかりませんでした', 404));
});

/* カスタムエラーハンドラ */
app.use((err, req, res, next) => {
  const { statusCode = 500} = err;
  if(!err.message){
    err.message = '問題が起きました'
  }
  res.status(statusCode).render('error',{err});
});

/* リクエストポート */
app.listen(3000, () => {
  console.log('ポート3000でリクエスト待機中...');
});