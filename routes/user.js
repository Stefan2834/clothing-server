const express = require('express');
const router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('./firebaseConfig')
const db = firebase.database()

router.post('/info', async (req, res, next) => {
    const { uid, email } = req.body;
    try {
        const banRef = db.ref('/banned/')
        const snapshot = await banRef.orderByChild('email').equalTo(email).once('value');
        if (snapshot.exists()) {
            const key = Object.keys(snapshot.val())[0]
            snapshot.val()[key].reason;
            res.json({ success: false, ban: true, reason: snapshot.val()[key].reason })
        } else {
            const detRef = db.ref('/users/' + uid + '/det');
            const favRef = db.ref('/users/' + uid + '/favorite');
            const cartRef = db.ref('/users/' + uid + '/cart');
            const orderRef = db.ref('/users/' + uid + '/order');
            const [detSnap, favSnap, cartSnap, orderSnap] = await Promise.all([
                detRef.once('value'),
                favRef.once('value'),
                cartRef.once('value'),
                orderRef.once('value'),
            ]);
            const data = {
                det: detSnap.val() || [],
                fav: favSnap.val() || [],
                cart: cartSnap.val() || [],
                order: orderSnap.val() || [],
            };
            res.json({ success: true, data: data, ban: false })
        }
    } catch (err) {
        res.json({ succces: false, message: err })
    }
})

router.post('/infoUpdate', (req, res, next) => {
    const { det, uid } = req.body
    try {
        const ref = db.ref('/users/' + uid + '/det')
        ref.set({
            info: det.info,
            tel: det.tel,
            email: det.email,
            name: det.name,
            type: det.type,
            county: det.county,
            newsLetter: det.newsLetter,
            color: det.color
        })
        res.json({ success: true })
    } catch (err) {
        res.json({ success: false, message: err })
    }
})

router.post('/favorite/add', (req, res, next) => {
    const { favorite, uid } = req.body
    try {
        const ref = db.ref('/users/' + uid + '/favorite')
        ref.set(favorite)
        res.json({ succes: true })
    } catch (err) {
        res.json({ succes: false, message: err })
    }
})

router.post('/cart/add', (req, res, next) => {
    const { cart, uid } = req.body
    try {
        const ref = db.ref('/users/' + uid + '/cart')
        ref.set(cart)
        res.json({ succes: true })
    } catch (err) {
        res.json({ succes: false, message: err })
    }
})



router.post('/order/add', (req, res, next) => {
    const { order, uid } = req.body
    try {
        const ref = db.ref('/users/' + uid + '/order')
        ref.set(order)
        res.json({ succes: true })
    } catch (err) {
        res.json({ succes: false, message: err })
    }
})

router.post('/product', (req, res, next) => {
    const { product } = req.body
    try {
        const ref = db.ref('/product')
        ref.set(product)
        res.json({ succes: true })
    } catch (err) {
        res.json({ succes: false, message: err })
    }
})

module.exports = router;