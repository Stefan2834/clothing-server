const express = require('express');
const router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('./firebaseConfig')
const db = firebase.database()

router.get('/', async (req, res, next) => {
  try {
    const productRef = db.ref('/product')
    const collectionsRef = db.ref('/collections/')
    const [productSnap, collectionsSnap] = await Promise.all([
      productRef.once("value"),
      collectionsRef.once("value")
    ])
    const product = productSnap.val() || {}
    const collections = collectionsSnap.val() || []
    res.json({ success: true, product: Object.values(product), collections: collections });
  } catch (err) {
    res.json({ success: false, message: err });
  }
})

router.post(`/review`, async (req, res, next) => {
  const { id } = req.body
  try {
    const reviewRef = db.ref('review/' + id)
    reviewRef.once(`value`, snapshot => {
      const review = snapshot.val() || {}
      res.json({ success: true, review: Object.values(review) })
    })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post(`/review/post`, async (req, res, next) => {
  const { review, id, user, date: date } = req.body
  try {
    const reviewRef = db.ref('review/' + id)
    await reviewRef.push({
      anonim: review.anonim,
      star: review.star,
      user: user,
      text: review.text,
      date: date
    })
    const starRef = db.ref(`/product/${id}/star/`)
    await starRef.once('value', snapshot => {
      const star = snapshot.val()
      const newStar = { nr: star.nr + 1, total: star.total + review.star }
      starRef.set(newStar)
      res.json({ success: true, star: newStar })
    })
  } catch (err) {
    res.send({ success: false, message: err })
  }
})

router.post(`/review/update`, async (req, res, next) => {
  const { review, user, id } = req.body
  try {
    let oldStar = 0;
    const reviewRef = db.ref(`/review/${id}`)
    await reviewRef.once('value', snapshot => {
      const reviews = Object.values(snapshot.val() || {})
      const index = reviews.findIndex(r => r.user === user)
      const reviewId = Object.keys(snapshot.val())[index]
      let reviewObj = {}
      oldStar = reviews[index].star
      reviewObj[reviewId] = { user: user, text: review.text, star: review.star, anonim: review.anonim, date: reviews[index].date }
      reviewRef.update(reviewObj)
    })
    let newStar
    const starRef = db.ref(`product/${id}/star`)
    await starRef.once('value', snapshot => {
      const star = snapshot.val()
      console.log(oldStar)
      newStar = { ...star, total: star.total - oldStar + review.star }
      starRef.set(newStar)
    })
    res.json({ success: true, star: newStar })
  } catch (err) {
    console.log(err)
    res.json({ success: false, message: err })
  }
})

router.post(`/review/delete`, async (req, res, next) => {
  const { user, id } = req.body
  try {
    let oldStar = 0;
    const reviewRef = db.ref(`/review/${id}`)
    await reviewRef.once('value', snapshot => {
      const reviews = Object.values(snapshot.val() || {})
      const index = reviews.findIndex(r => r.user === user)
      const reviewId = Object.keys(snapshot.val() || {})[index]
      let reviewObj = {}
      oldStar = reviews[index].star
      reviewObj[reviewId] = null
      reviewRef.update(reviewObj)
    })
    let newStar
    const starRef = db.ref(`product/${id}/star/`)
    await starRef.once('value', snapshot => {
      const star = snapshot.val()
      newStar = { nr: star.nr - 1, total: star.total - oldStar }
      starRef.set(newStar)
    })
    res.json({ success: true, star: newStar })
  } catch (err) {
    console.log(err)
    res.json({ success: false, message: err })
  }
})

module.exports = router;