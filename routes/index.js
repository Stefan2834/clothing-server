var express = require('express');
var router = express.Router();
const stripe = require('stripe')('sk_test_51N0nLNJak7XWs1IO8u8wQQjt9OoUFdDz2i5kdoBxsYRa41Cnc80Loj0I1Ipfn8i6hRNzGIt1NlcPqj0R8sJ6a5T300hBszp6s1');
const { Error, Order, Product, Discount } = require('./Schema')

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Blisst server' });
});

router.post('/orderUpdate', async (req, res, next) => {
  const { order, uid, cart } = req.body
  try {
    const newOrder = new Order({
      ...order, uid: uid
    })
    await newOrder.save()
    await cart.forEach(async cart => {
      const id = cart.id
      const product = await Product.findOne({ id })
      product.size[cart.selectedSize] -= cart.number
      await product.save()
    })
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post('/discount', async (req, res, next) => {
  const { discountCode, email } = req.body;
  try {
    const discount = await Discount.findOne({ code: discountCode })
    if (!discount) {
      res.json({ success: false, message: "Codul este greșit sau a expirat" });
      return;
    }
    if (discount.user.includes(email)) {
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
    await Discount.updateOne(
      { code },
      { $push: { 'user': email } }
    );
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, err: err })
  }
})

router.post(`/error`, async (req, res, next) => {
  const { email, error } = req.body
  try {
    const newError = new Error({
      email: email,
      error: error
    })
    await newError.save()
    res.json({ success: true, message: 'Problema a fost raportata cu succes' })
  } catch (err) {
    res.json({ success: false, message: `Eroare: ${err.code}` })
  }
})

router.post('/create-checkout-session', async (req, res) => {
  const { orderData } = req.body
  try {
    const newOrder = encodeURIComponent(JSON.stringify(orderData));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'ron',
          product_data: {
            name: 'De plată:',
          },
          unit_amount: (JSON.parse(orderData.price.total) * 100).toFixed(0)
        },
        quantity: 1,
      }],
      mode: 'payment',
      // success_url: `http://localhost:3000/placeOrder/${newOrder}`,
      // cancel_url: 'http://localhost:3000/main',
      success_url: `https://blisst-clothing.web.app/placeOrder/${newOrder}`,
      cancel_url: 'https://blisst-clothing.web.app/main'
    });
    res.json({ success: true, url: session.url });
  } catch (err) {
    res.json({ success: false, message: err })
  }
});



module.exports = router;
