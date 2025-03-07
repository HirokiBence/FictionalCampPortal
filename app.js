const express = require('express');
const app = express();
const ejsMate = require('ejs-mate');
const path = require('path');
const mongoose = require('mongoose');
const ampground = require('./models/campground');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const { campgroundSchema, reviewSchema } = require('./schemas');
const { descriptors } = require('./seeds/seedHelpers');
const Campground = require('./models/campground');
const Review = require('./models/review');
const campgroundRoutes = require('./routes/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => {
    console.log('MongoDBコネクションOK!');
  })
  .catch(err => {
    console.log('コネクションエラー！');
    console.log(err);
  })

/* ミドルウェア */
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if(error){
    const msg = error.details.map(detail => detail.message).join(',');
    throw new ExpressError(msg, 400);
  }else{
    next();
  }
}

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if(error){
    const msg = error.details.map(detail => detail.message).join(',');
    throw new ExpressError(msg, 400);
  }else{
    next();
  }
}

/* ホーム画面 */
app.get('/', (req, res) => {
  res.render('home');
});

/* campgrounds */
app.use('/campgrounds', campgroundRoutes);

/* レビュー投稿処理 */
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}))

/* レビュー削除処理 */
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync (async (req, res) => {
  const {id, reviewId} = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId }});
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/campgrounds/${ id }`);
}));

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

app.listen(3000, () => {
  console.log('ポート3000でリクエスト待機中...');
});