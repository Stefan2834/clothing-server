var express = require('express');
var router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('./firebaseConfig')
const db = firebase.database()
const stripe = require('stripe')('sk_test_51N0nLNJak7XWs1IO8u8wQQjt9OoUFdDz2i5kdoBxsYRa41Cnc80Loj0I1Ipfn8i6hRNzGIt1NlcPqj0R8sJ6a5T300hBszp6s1');


router.get('/', function (req, res, next) {
  res.render('index', { title: 'Welcome to server' });
});

router.post('/commandUpdate', async (req, res, next) => {
  const { command, uid } = req.body
  try {
    const dbRef = db.ref('commands');
    const commands = await dbRef.once('value').then(snapshot => snapshot.val() || []);
    const commandToPush = { ...command, uid: uid }
    commands.push(commandToPush);
    await dbRef.set(commands);
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



router.post('/charge', async (req, res) => {
  try {
    const { amount, token } = req.body;

    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      description: 'Example charge',
      source: token.id,
    });

    res.json({ success: true, message: 'Payment successful' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: `Payment failed: ${err}` });
  }
});

router.post('/create-checkout-session', async (req, res) => {
  const { cart, discount, total } = req.body
  console.log(cart)
  try {
    // if(discount !== 0) {
    //   cart.push({name: 'Discount', price: })
    // }
    cart.push({ name: 'Transport', price: total > 200 ? 0 : 20 * 100 })
    console.log(cart)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cart.map(cart => {
        if (cart.name !== 'Transport') {
          return {
            price_data: {
              currency: 'ron',
              product_data: {
                name: cart.name,
              },
              unit_amount: (cart.price + 0.01 - ((cart.price + 0.01) * cart.discount) - 0.01) * 100
            },
            quantity: cart.number
          }
        } else {
          return {
            price_data: {
              currency: 'ron',
              product_data: {
                name: cart.name,
              },
              unit_amount: cart.price
            },
            quantity: 1
          }
        }
      }),
      mode: 'payment',
      success_url: 'https://clothing-shop2834.web.app/main', // the URL to redirect to after successful payment
      cancel_url: 'https://clothing-shop2834.web.app/main',
    });
    res.json({ success: true, url: session.url });
  } catch (err) {
    res.json({ success: false, message: err })
  }
});



module.exports = router;
