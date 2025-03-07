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


/* キャンプ場の一覧ページ */
app.get('/campgrounds', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
}));

/* キャンプ場の新規登録ページ */
app.get('/campgrounds/new', catchAsync(async (req, res) => {
  res.render('campgrounds/new');
}));

/* 作成処理 */
app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${ campground._id }`);
}));

/* キャンプ場の詳細ページ */
app.get('/campgrounds/:id', catchAsync(async(req, res) => {
  const campground = await Campground.findById(req.params.id).populate('reviews');
  // console.log(campground);
  res.render('campgrounds/show', { campground });
}));

/* キャンプ場の編集ページ */
app.get('/campgrounds/:id/edit', catchAsync(async(req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/edit', { campground });
}));

/* 更新処理 */
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  res.redirect(`/campgrounds/${ id }`);
}));

/* 削除処理 */
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
}));

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

/* リクエストポート */
app.listen(3000, () => {
  console.log('ポート3000でリクエスト待機中...');
});