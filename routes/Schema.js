const mongoose = require('mongoose')

const detSchema = new mongoose.Schema({
  color: String,
  county: String,
  email: String,
  name: String,
  info: String,
  newsLetter: Boolean,
  tel: String,
  type: String
});

const productSchema = new mongoose.Schema({
  colors: [String],
  discount: Number,
  id: String,
  name: String,
  number: Number,
  photo: String,
  price: Number,
  selectedSize: String,
  sex: String,
  size: {
    XS: Number,
    S: Number,
    M: Number,
    L: Number,
    XL: Number,
    XXL: Number,
    37: Number,
    38: Number,
    39: Number,
    40: Number,
    41: Number,
    42: Number,
    43: Number,
    44: Number,
  },
  sliderPhoto: [String],
  spec: String,
  star: {
    nr: Number,
    total: Number,
  },
  type: String
})

const orderSchema = new mongoose.Schema({
  date: String,
  details: detSchema,
  id: Number,
  method: String,
  price: {
    code: String,
    delivery: Number,
    discount: Number,
    productPrice: Number,
    total: Number,
  },
  product: [productSchema],
  status: String
})

const userSchema = new mongoose.Schema({
  password: String,
  uid: String,
  email: String,
  cart: [{
    id: String,
    number: Number,
    selectedSize: String
  }],
  det: detSchema,
  favorite: [{
    id: String
  }],
  order: [orderSchema],
});

const banSchema = new mongoose.Schema({
  email: String,
  reason: String
})

const adminSchema = new mongoose.Schema({
  email: String
})

const newsLetterSchema = new mongoose.Schema({
  email: String
})

const collectionSchema = new mongoose.Schema({
  name: String,
  photo: String
})

const reviewSchema = new mongoose.Schema({
  id: String,
  list: [{
    anonim: Boolean,
    date: String,
    star: Number,
    text: String,
    user: String
  }]
});
const dailySchema = new mongoose.Schema({
  id: String
})

const errorSchema = new mongoose.Schema({
  email: String,
  error: String
})

const discountSchema = new mongoose.Schema({
  user: [String],
  value: Number,
  code: String
})


const User = mongoose.model('user', userSchema);
const Ban = mongoose.model('ban', banSchema)
const Admin = mongoose.model('admin', adminSchema)
const NewsLetter = mongoose.model('newsLetter', newsLetterSchema)
const Product = mongoose.model('product', productSchema)
const Collection = mongoose.model('collection', collectionSchema)
const Review = mongoose.model('review', reviewSchema)
const Daily = mongoose.model('daily', dailySchema)
const Error = mongoose.model('error', errorSchema)
const Order = mongoose.model('order', orderSchema)
const Discount = mongoose.model('discount', discountSchema)





module.exports = {
  User,
  Ban,
  Admin,
  NewsLetter,
  Product,
  Collection,
  Review,
  Daily,
  Error,
  Order,
  Discount
}
