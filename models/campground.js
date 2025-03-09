const mongoose = require('mongoose');
const Review = require('./review');
const { Schema } = mongoose;

const campgroundSchema = Schema({
  title: String,
  image: String,
  price: Number,
  location: String,
  description: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    }
  ],
});

campgroundSchema.post('findOneAndDelete', async function(doc) {
  if(doc){
    await Review.deleteMany({
      _id:{
        $in: doc.reviews
      }
    })
  }
});

module.exports = mongoose.model('Campground', campgroundSchema);