const express = require('express');
const router = express.Router();
const { sendNewsLetterEmail } = require('./email.js')
const {
  Order,
  User,
  Discount,
  Error,
  Owner,
  Admin,
  Collection,
  Ban,
  Product,
  Review
} = require('./Schema');


router.get(`/orders`, async (req, res, next) => {
  try {
    const order = await Order.find({})
    res.json({ success: true, orders: order })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})
router.post('/orders', async (req, res, next) => {
  const { uid, date, status } = req.body;
  try {
    const orders = await Order.findOne({ date, uid })
    orders.status = status
    await orders.save()
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err });
  }
});

router.post(`/status`, async (req, res, next) => {
  const { uid, date, status } = req.body
  try {
    await User.findOneAndUpdate(
      { uid: uid, 'order.date': date },
      { $set: { 'order.$.status': status } },
      { new: true }
    );
    res.json({ success: true })
  } catch (err) {
    console.log(err)
    res.json({ success: false, message: err })
  }
})

router.post('/order/cancel', async (req, res, next) => {
  const { cart } = req.body
  try {
    cart.forEach(async (cartItem) => {
      const product = await Product.findOne({ id: cartItem.id })
      const size = product.size[cartItem.selectedSize];
      const newSize = Number(size) + Number(cartItem.number);
      product.size[cartItem.selectedSize] = newSize;
      await product.save();
    });
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.get('/discount', async (req, res, next) => {
  try {
    const discount = await Discount.find({})
    res.json({ success: true, discount: discount })
  } catch (err) {
    res.json({ success: false, message: `Eroare:${err.code}` })
  }
})

router.post('/discount', async (req, res, next) => {
  const { value, code } = req.body
  try {
    const findDiscount = await Discount.findOne({ code })
    if (!findDiscount) {
      const discount = new Discount({ code: code, value: value, user: [] });
      await discount.save();
      res.json({ success: true, message: 'Codul a fost creat cu succes.' })
    } else {
      res.json({ success: false, message: 'Codul există deja.' })
    }
  } catch (err) {
    res.json({ success: false, message: `Eroare:${err.code}` })
  }
})

router.post('/discountDelete', async (req, res, next) => {
  const { discount } = req.body
  try {
    await Discount.deleteOne({ code: discount.code });
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: `Eroare:${err.code}` })
  }
})

router.get('/errors', async (req, res, next) => {
  try {
    const errors = await Error.find({})
    res.json({ success: true, errors: errors })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post('/errors', async (req, res, next) => {
  const { _id } = req.body
  try {
    await Error.findOneAndDelete({ _id: _id });
    res.json({ success: true, message: 'Error deleted successfully' });
  } catch (err) {
    res.json({ success: false, message: err });
  }
});

router.get(`/product`, async (req, res, next) => {
  try {
    const product = await Product.find({})
    res.json({ success: true, product: product })
  } catch (err) {
    res.json({ success: false })
  }
})

router.post(`/product`, async (req, res, next) => {
  const { newProduct } = req.body
  try {
    const findProduct = await Product.find({ id: newProduct.id })
    if (!findProduct) {
      const setNewProduct = {
        name: newProduct.name,
        id: newProduct.id,
        photo: newProduct.photo[0],
        colors: newProduct.colors,
        discount: (newProduct.discount / 100).toFixed(2),
        price: Number(newProduct.price) - 0.01,
        sex: newProduct.sex,
        sliderPhoto: [newProduct.photo[1], newProduct.photo[2], newProduct.photo[3]],
        type: newProduct.collection ? `${newProduct.type} collection ${newProduct.collection}` : newProduct.type,
        spec: newProduct.spec,
        star: { total: 0, nr: 0 },
        size: newProduct.size
      }
      const product = await new Product(setNewProduct)
      await product.save()
      sendNewsLetterEmail(20, { photo: newProduct.photo[0], id: newProduct.id })
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Acest id este deja folosit. Introdu altul.' })
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
})

router.post('/productUpdate', async (req, res, next) => {
  const { product } = req.body
  try {
    let newProduct = await Product.findOne({ id: product.id })
    Object.assign(newProduct, product);
    await newProduct.save();
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.json({ success: false, message: err })
  }
})

router.post('/productDelete', async (req, res, next) => {
  const { id } = req.body
  try {
    await Product.findOneAndDelete({ id })
    await Review.findOneAndDelete({ id })
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.get('/owner', async (req, res, next) => {
  try {
    const owner = await Owner.find({})
    res.json({ success: true, owner: owner[0].email })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.get('/admins', async (req, res, next) => {
  try {
    const admins = await Admin.find({})
    const adminsArray = admins.map(admin => admin.email)
    res.json({ success: true, admins: adminsArray })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post('/admins', async (req, res, next) => {
  const { email } = req.body
  try {
    const findUser = await User.findOne({ email })
    if (findUser) {
      const findBan = await Ban.findOne({ email })
      if (!findBan) {
        const findAdmin = await Admin.findOne({ email })
        if (!findAdmin) {
          const admin = await new Admin({ email: email })
          await admin.save()
          res.json({ success: true })
        } else {
          res.json({ success: false, message: 'Acest utilizator este deja admin' })
        }
      } else {
        res.json({ success: false, message: 'Acest utilizator este banat' })
      }
    } else {
      res.json({ success: false, message: 'Utilizatorul nu există' })
    }
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post(`/delete`, async (req, res, next) => {
  const { email } = req.body
  try {
    await Admin.deleteOne({ email })
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post(`/review`, async (req, res, next) => {
  const { user, star, id } = req.body
  try {
    const findReview = await Review.findOne({ id })
    const reviewIndex = findReview.list.findIndex((reviewItem) => reviewItem.user === user);
    findReview.list.splice(reviewIndex, 1);
    await findReview.save();
    const product = await Product.findOneAndUpdate({ id }, {
      $inc: {
        'star.total': -star,
        'star.nr': -1,
      },
    },
      { new: true }
    )
    res.json({ success: true, star: product.star })
  } catch (err) {
    res.json({ success: false })
  }
})

router.get(`/collections`, async (req, res, next) => {
  try {
    const coll = await Collection.find({})
    res.json({ success: true, collections: coll })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post(`/collections`, async (req, res, next) => {
  const { name, photo } = req.body
  try {
    const findColl = await Collection.findOne({ name })
    if (findColl) {
      res.json({ success: false, message: 'Această colecție deja există.' })
    } else {
      const coll = await new Collection({ name: name, photo: photo })
      await coll.save()
      res.json({ success: true })
    }
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post(`/collectionsDelete`, async (req, res, next) => {
  const { name } = req.body
  try {
    await Collection.deleteOne({ name })
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})


router.get(`/ban`, async (req, res, next) => {
  try {
    const ban = await Ban.find({})
    res.json({ success: true, ban: ban })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})


router.post(`/ban`, async (req, res, next) => {
  const { email, reason } = req.body
  try {
    const findUser = await User.findOne({ email })
    if (findUser) {
      const admin = await Admin.findOne({ email })
      if (admin) {
        res.json({ success: false, message: 'Nu poți bana un admin.' })
      } else {
        const findBan = await Ban.findOne({ email })
        if (findBan) {
          res.json({ success: false, message: 'Acest utilizator este deja banat.' })
        } else {
          const ban = await new Ban({ email: email, reason: reason })
          await ban.save()
          res.json({ success: true })
        }
      }
    } else {
      res.json({ success: false, message: 'Acest utilizator nu există.' })
    }
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post('/banDelete', async (req, res, next) => {
  const { email } = req.body
  try {
    await Ban.findOneAndRemove({ email })
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false })
  }
})

module.exports = router;
