var express = require('express');
var router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_KEY);
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
      success_url: `${process.env.WEBSITE_KEY}/placeOrder/${newOrder}`,
      cancel_url: `${process.env.WEBSITE_KEY}/main`
    });
    res.json({ success: true, url: session.url });
  } catch (err) {
    res.json({ success: false, message: err })
  }
});



module.exports = router;
