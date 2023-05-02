const express = require('express');
const router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('./firebaseConfig')
const db = firebase.database()

router.get(`/commands`, async (req, res, next) => {
  try {
    const commandsRef = db.ref("commands/")
    await commandsRef.once("value", snapshot => {
      const commands = snapshot.val() || []
      res.json({ success: true, commands: commands })
    })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})
router.post('/commands', async (req, res, next) => {
  const { commands } = req.body
  try {
    const commandsRef = db.ref('commands')
    await commandsRef.set(commands)
  } catch (err) {
    req.json({ success: false, message: err })
  }
})

router.post(`/status`, async (req, res, next) => {
  const { uid, id, status } = req.body
  try {
    const ref = db.ref('users/' + uid + '/command/' + id + '/status/')
    await ref.set(status)
    res.json({ succes: true })
  } catch (err) {
    res.json({ succes: false, message: err })
  }
})

router.get('/discount', async (req, res, next) => {
  try {
    const ref = db.ref('discount')
    await ref.once('value', snapshot => {
      const discount = snapshot.val()
      const discountArray = Object.entries(discount).map(([code, { value }]) => ({ code, value }));
      res.json({ succes: true, discount: discountArray })
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
      res.json({ succes: true, message: 'Codul a fost creat  cu succes' })
    })
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
      sliderPhoto: [newProduct.photo[1],newProduct.photo[2],newProduct.photo[3]],
      type: newProduct.type,
      spec: newProduct.spec,
      star: {total:0, nr:0},
      size: newProduct.size
    })
    res.json({ success: true });
  } catch (err) {
    console.error('Error uploading file: ', err);
    res.json({ success: false, message: err.message });
  }
})


module.exports = router;
