const express = require('express');
const router = express.Router();
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas');

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if(error){
    const msg = error.details.map(detail => detail.message).join(','); // detailsが配列なので、中身が複数あった場合を考慮してループを回し、全てのmessageを表示するようにしている
    throw new ExpressError(msg, 400);
  }else{
    next();
  }
}

/* キャンプ場の一覧ページ */
router.get('/', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
}));

/* キャンプ場の新規登録ページ */
router.get('/new', catchAsync(async (req, res) => {
  res.render('campgrounds/new');
}));

/* 作成処理 */
router.post('/', validateCampground, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', '新しいキャンプ場を登録しました');
    res.redirect(`/campgrounds/${ campground._id }`);
}));

/* キャンプ場の詳細ページ */
router.get('/:id', catchAsync(async(req, res) => {
  const campground = await Campground.findById(req.params.id).populate('reviews');
  res.render('campgrounds/show', { campground });
}));

/* キャンプ場の編集ページ */
router.get('/:id/edit', catchAsync(async(req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/edit', { campground });
}));

/* 更新処理 */
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  res.redirect(`/campgrounds/${ id }`);
}));

/* 削除処理 */
router.delete('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
}));

module.exports = router;