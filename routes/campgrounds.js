const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controller/campgrounds');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');


/* キャンプ場の一覧ページ */
router.get('/', catchAsync(campgrounds.index));

/* キャンプ場の新規登録ページ */
router.get('/new', isLoggedIn, catchAsync(campgrounds.renderNewForm));

/* 登録処理 */
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

/* キャンプ場の詳細ページ */
router.get('/:id', catchAsync(campgrounds.showCampground));

/* キャンプ場の編集ページ */
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

/* 更新処理 */
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

/* 削除処理 */
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;