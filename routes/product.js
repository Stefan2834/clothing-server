const express = require('express');
const router = express.Router();
const { Product, Collection, Review } = require('./Schema')

router.get('/', async (req, res, next) => {
  try {
    const collections = await Collection.find({}) || [];
    res.json({ success: true, collections: collections });
  } catch (err) {
    console.log(err)
    res.json({ success: false, message: err });
  }
})

router.post('/getMany', async (req, res, next) => {
  const { path } = req.body
  try {
    const products = await Product.find({ type: { $regex: path, $options: 'i' } });
    res.json({ success: true, product: products })
  } catch (err) {
    res.json({ success: false, message: err.code })
  }
})

router.post('/getOne', async (req, res, next) => {
  const { path } = req.body
  try {
    const product = await Product.findOne({ id: path })
    if (product) {
      res.json({ success: true, product: product })
    } else {
      res.json({ success: false })
    }
  } catch (err) {
    res.json({ success: false, message: err.code })
  }
})

router.post(`/review`, async (req, res, next) => {
  const { id } = req.body
  try {
    const reviewList = await Review.findOne({ id })
    if (!reviewList) {
      res.json({ success: true, review: [] })
    } else {
      res.json({ success: true, review: reviewList.list })
    }
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post(`/review/post`, async (req, res, next) => {
  const { review, id, user, date: date } = req.body
  try {
    const newReview = {
      anonim: review.anonim,
      star: review.star,
      user: user,
      text: review.text,
      date: date
    }
    const findReview = await Review.findOne({ id })
    if (!findReview) {
      const createdReview = new Review({ id: id });
      createdReview.list.push(newReview);
      await createdReview.save();
    } else {
      findReview.list.push(newReview)
      await findReview.save()
    }
    const star = await Product.findOneAndUpdate(
      { id },
      {
        $inc: {
          'star.total': review.star,
          'star.nr': 1
        }
      },
      { new: true }
    );
    res.json({ success: true })
  } catch (err) {
    console.log(err)
    res.send({ success: false, message: err })
  }
})

router.post(`/review/update`, async (req, res, next) => {
  const { review, user, id } = req.body
  try {
    let oldStar = 0;
    const reviewUpdate = await Review.findOne({ id })
    const reviewToUpdate = reviewUpdate.list.find((reviewItem) => reviewItem.user === user);
    oldStar = reviewToUpdate.star
    reviewToUpdate.anonim = review.anonim
    reviewToUpdate.star = review.star;
    reviewToUpdate.text = review.text;
    await reviewUpdate.save()
    const product = await Product.findOneAndUpdate({ id }, {
      $inc: {
        'star.total': review.star - oldStar
      },
    },
      { new: true }
    )
    res.json({ success: true })
  } catch (err) {
    console.log(err)
    res.json({ success: false, message: err })
  }
})

router.post(`/review/delete`, async (req, res, next) => {
  const { user, id } = req.body
  try {
    const findReview = await Review.findOne({ id })
    const reviewIndex = findReview.list.findIndex((reviewItem) => reviewItem.user === user);
    const oldStar = findReview.list.find(rev => rev.user === user).star
    findReview.list.splice(reviewIndex, 1);
    await findReview.save();
    const product = await Product.findOneAndUpdate({ id }, {
      $inc: {
        'star.total': -oldStar,
        'star.nr': -1,
      },
    },
      { new: true }
    )
    res.json({ success: true })
  } catch (err) {
    console.log(err)
    res.json({ success: false, message: err })
  }
})

router.post(`/verifyStock`, async (req, res, next) => {
  const { cart } = req.body
  try {
    let success = true;
    await Promise.all(cart.map(async (cartItem) => {
      const product = await Product.findOne({ id: cartItem.id });
      if (product.size[cartItem.selectedSize] < cartItem.number) {
        success = false;
      }
    }));
    if (success) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Stocul nu mai este disponibil. Dă-i un refresh, iar stocul va fi updatat automat.' });
    }
  } catch (err) {
    console.log(err)
    res.json({ success: true, message: err.code })
  }
})

module.exports = router;