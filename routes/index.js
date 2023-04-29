var express = require('express');
var router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('./firebaseConfig')
const db = firebase.database()
const stripe = require('stripe')('sk_test_51N0nLNJak7XWs1IO8u8wQQjt9OoUFdDz2i5kdoBxsYRa41Cnc80Loj0I1Ipfn8i6hRNzGIt1NlcPqj0R8sJ6a5T300hBszp6s1');


router.get('/', function (req, res, next) {
  res.render('index', { title: 'Blisst server' });
});

router.post('/commandUpdate', async (req, res, next) => {
  const { command, uid, cart } = req.body
  try {
    const dbRef = db.ref('commands');
    const commands = await dbRef.once('value').then(snapshot => snapshot.val() || []);
    const commandToPush = { ...command, uid: uid }
    commands.push(commandToPush);
    await dbRef.set(commands);
    await cart.map(async cart => {
      const productRef = db.ref(`/product/${cart.id}/size/${cart.selectedSize}/`)
      await productRef.once("value", snapshot => {
        const oldStoc = snapshot.val()
        productRef.set(oldStoc - cart.number)
      })
    })
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post('/discount', async (req, res, next) => {
  const { discountCode, email } = req.body;
  try {
    const discountRef = db.ref(`discount/${discountCode}`);
    const snapshot = await discountRef.once('value');
    const discount = snapshot.val();

    if (!discount) {
      res.json({ success: false, message: "Codul este gresit sau a expirat" });
      return;
    }

    const oldUser = Object.values(discount.user || []);
    if (oldUser.includes(email)) {
      res.json({ success: false, message: 'Ai mai folosit acest cod' });
      return;
    } else {
      res.json({ success: true, discount: discount.value });
      return
    }

  } catch (err) {
    res.json({ success: false, message: err.code });
  }
});

router.post('/discountOnce', async (req, res, next) => {
  const { email, code } = req.body
  try {
    console.log(code)
    const discountRef = db.ref('discount/' + code + '/user/')
    discountRef.push(email)
  } catch (err) {

  }
})

router.post(`/error`, async (req, res, next) => {
  const { email, error } = req.body
  try {
    console.log(email, error)
    const ref = db.ref('errors')
    ref.once('value', snapshot => {
      const errors = snapshot.val() || []
      errors.push({ email: email, error: error })
      ref.set(errors)
    })
    res.json({ success: true, message: 'Problema a fost raportata cu succes' })
  } catch (err) {
    res.json({ success: false, message: `Eroare: ${err.code}` })
  }
})



router.post('/create-checkout-session', async (req, res) => {
  const { commandData } = req.body
  try {
    const newCommand = encodeURIComponent(JSON.stringify(commandData));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'ron',
          product_data: {
            name: 'De plată:',
          },
          unit_amount: JSON.parse(commandData.price.total) * 100
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `http://localhost:3000/creditCard/${newCommand}`,
      cancel_url: 'http://localhost:3000/main',
      // success_url: `https://clothing-shop2834.web.app/creditCard/${newCommand}`,
      // cancel_url: 'https://clothing-shop2834.web.app/main'
    });
    res.json({ success: true, url: session.url });
  } catch (err) {
    console.log(err)
    res.json({ success: false, message: err })
  }
});



module.exports = router;
