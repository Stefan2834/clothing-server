const express = require('express');
const router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('./firebaseConfig')
const db = firebase.database()

router.get(`/orders`, async (req, res, next) => {
  try {
    const ordersRef = db.ref("orders/")
    await ordersRef.once("value", snapshot => {
      const orders = snapshot.val() || {}
      res.json({ success: true, orders: Object.values(orders) })
    })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})
router.post('/orders', async (req, res, next) => {
  const { uid, id, status } = req.body;
  try {
    const ordersRef = db.ref('orders/');
    const snapshot = await ordersRef.once('value');
    const orders = snapshot.val();
    const pushId = Object.keys(orders).find((orderId) => {
      const order = orders[orderId];
      if (order.uid === uid && order.id === id) {
        return true;
      }
      return false;
    });
    const newRef = db.ref(`orders/${pushId}/status/`)
    await newRef.set(status)
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err });
  }
});

router.post(`/status`, async (req, res, next) => {
  const { uid, id, status } = req.body
  try {
    const ref = db.ref('users/' + uid + '/order/' + id + '/status/')
    await ref.set(status)
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post('/order/cancel', async (req, res, next) => {
  const { cart } = req.body
  try {
    cart.forEach((cartItem) => {
      const sizeRef = db.ref(`/product/${cartItem.id}/size/${cartItem.selectedSize}`);
      sizeRef.once('value', (snapshot) => {
        const size = snapshot.val();
        const newSize = Number(size) + Number(cartItem.number);
        sizeRef.set(newSize);
      });
    });
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.get('/discount', async (req, res, next) => {
  try {
    const ref = db.ref('discount')
    await ref.once('value', snapshot => {
      const discount = snapshot.val()
      const discountArray = Object.entries(discount).map(([code, { value }]) => ({ code, value }));
      res.json({ success: true, discount: discountArray })
    })
  } catch (err) {
    res.json({ success: false, message: `Eroare:${err.code}` })
  }
})

router.post('/discount', async (req, res, next) => {
  const { value, code } = req.body
  try {
    const ref = db.ref('discount')
    await ref.once('value', snapshot => {
      const discount = snapshot.val()
      ref.set({ ...discount, [code]: { value: value, user: [] } })
      res.json({ success: true, message: 'Codul a fost creat cu succes.' })
    })
  } catch (err) {
    res.json({ success: false, message: `Eroare:${err.code}` })
  }
})

router.post('/discountDelete', async (req, res, next) => {
  const { discount } = req.body
  try {
    const ref = db.ref(`discount/${discount.code}`)
    ref.set(null)
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: `Eroare:${err.code}` })
  }
})


router.get('/errors', async (req, res, next) => {
  try {
    const ref = db.ref('errors')
    ref.once('value', (snapshot) => {
      const errors = snapshot.val();
      res.json({ success: true, errors: errors })
    });
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post('/errors', async (req, res, next) => {
  const { id } = req.body
  try {
    const ref = db.ref('errors/');
    ref.once('value', snapshot => {
      const errors = snapshot.val() || []
      console.log(`ID: ${id}`)
      errors.splice(id, 1)
      ref.set(errors);
    })
    res.json({ success: true, message: 'Error deleted successfully' });
  } catch (err) {
    res.json({ success: false, message: err });
  }
});

router.post(`/product`, async (req, res, next) => {
  const { newProduct } = req.body
  try {
    const productRef = db.ref(`/product/${newProduct.id}`)
    productRef.set({
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
    })
    res.json({ success: true });
  } catch (err) {
    console.error('Error uploading file: ', err);
    res.json({ success: false, message: err.message });
  }
})

router.post('/productUpdate', async (req, res, next) => {
  const { product } = req.body
  try {
    const ref = db.ref(`product/${product.id}`)
    await ref.set(product)
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post('/productDelete', async (req, res, next) => {
  const { id } = req.body
  try {
    const productRef = db.ref(`/product/${id}`)
    await productRef.set(null)
    const reviewRef = db.ref(`/review/${id}`)
    await reviewRef.set(null)
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.get('/owner', async (req, res, next) => {
  try {
    const ownerRef = db.ref('/owner/')
    await ownerRef.once("value", snapshot => {
      const owner = snapshot.val()
      res.json({ success: true, owner: owner })
    })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.get('/admins', async (req, res, next) => {
  try {
    const adminsRef = db.ref('/admin/')
    await adminsRef.once("value", snapshot => {
      const admins = Object.values(snapshot.val())
      res.json({ success: true, admins: admins })
    })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post('/admins', async (req, res, next) => {
  const { uid, email } = req.body
  try {
    const newAdminRef = db.ref(`/admin/${uid}/`)
    newAdminRef.set(email)
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post(`/delete`, async (req, res, next) => {
  const { email } = req.body
  try {
    const adminRef = db.ref('/admin/')
    await adminRef.once("value", snapshot => {
      const admin = snapshot.val()
      const uidToDelete = Object.keys(admin).find(uid => admin[uid] === email);
      adminRef.set({ ...admin, [uidToDelete]: null })
    })
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post(`/review`, async (req, res, next) => {
  const { user, star, id } = req.body
  try {
    const reviewRef = db.ref(`/review/${id}`)
    await reviewRef.once('value', snapshot => {
      const reviews = Object.values(snapshot.val() || {})
      const index = reviews.findIndex(r => r.user === user)
      const reviewId = Object.keys(snapshot.val() || {})[index]
      let reviewObj = {}
      reviewObj[reviewId] = null
      reviewRef.update(reviewObj)
    })
    let newStar
    const starRef = db.ref(`product/${id}/star/`)
    await starRef.once('value', snapshot => {
      const starVal = snapshot.val()
      newStar = { nr: starVal.nr - 1, total: starVal.total - star }
      starRef.set(newStar)
    })
    res.json({ success: true, star: newStar })
  } catch (err) {
    res.json({ success: false })
  }
})

router.get(`/collections`, async (req, res, next) => {
  try {
    const collRef = db.ref('/collections/')
    await collRef.once("value", snapshot => {
      const coll = snapshot.val() || []
      res.json({ success: true, collections: coll })
    })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post(`/collections`, async (req, res, next) => {
  const { name, photo } = req.body
  try {
    const collRef = db.ref('/collections')
    await collRef.once("value", async snapshot => {
      let coll = snapshot.val() || []
      coll = [...coll, { name: name, photo: photo }]
      await collRef.set(coll)
      res.json({ success: true })
    })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post(`/collectionsDelete`, async (req, res, next) => {
  const { name } = req.body
  try {
    const collRef = db.ref('/collections')
    await collRef.once("value", async snapshot => {
      let coll = snapshot.val() || []
      coll = await coll.map(c => {
        if (c.name === name) {
          return null
        } else {
          return c
        }
      }).filter(c => c != null)
      await collRef.set(coll)
      res.json({ success: true })
    })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})


router.get(`/ban`, async (req, res, next) => {
  try {
    const banRef = db.ref('/banned/')
    await banRef.once("value", snapshot => {
      const ban = Object.values(snapshot.val() || {}) || []
      res.json({ success: true, ban: ban })
    })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})


router.post(`/ban`, async (req, res, next) => {
  const { email, reason } = req.body
  try {
    const adminRef = db.ref('/admin/')
    const snapshot = await adminRef.orderByValue().equalTo(email).once('value');
    if (snapshot.exists()) {
      res.json({ success: false, message: 'Nu poți bana un admin.' })
    } else {
      const banRef = db.ref('/banned')
      banRef.push({ email: email, reason: reason })
      res.json({ success: true })
    }
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post('/banDelete', async (req, res, next) => {
  const { email } = req.body
  try {
    const banRef = db.ref(`/banned`)
    const snapshot = await banRef.orderByChild('email').equalTo(email).once('value')
    const key = Object.keys(snapshot.val())[0]
    await banRef.child(key).remove()
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false })
  }
})

module.exports = router;
