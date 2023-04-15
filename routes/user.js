const express = require('express');
const router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('./firebaseConfig')
const db = firebase.database()

router.post('/info', async (req, res, next) => {
    const { uid } = req.body;
    try {
        const detRef = db.ref('/users/' + uid + '/det/');
        detRef.once('value', (snapshot) => {
            const info = snapshot.val();
            res.json({ det: info })
        });
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
            newsLetter:det.newsLetter,
            color: det.color
        })
        res.json({ success: true })
    } catch (err) {
        res.json({ success: false, message: err })
    }
})

router.post('/favorite/get', (req, res, next) => {
    const { uid } = req.body
    try {
        const favRef = db.ref('/users/' + uid + '/favorite/');
        favRef.once('value', (snapshot) => {
            const info = snapshot.val();
            res.json({ fav: info })
        });
    } catch (err) {
        res.json({ succces: false, message: err })
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

router.post('/cart/get', (req, res, next) => {
    const { uid } = req.body
    try {
        const cartRef = db.ref('/users/' + uid + '/cart/');
        cartRef.once('value', (snapshot) => {
            const info = snapshot.val();
            res.json({ cart: info })
        });
    } catch (err) {
        res.json({ succces: false, message: err })
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

router.post('/command/get', (req, res, next) => {
    const { uid } = req.body
    try {
        const commandRef = db.ref('/users/' + uid + '/command/');
        commandRef.once('value', (snapshot) => {
            const info = snapshot.val();
            res.json({ command: info })
        });
    } catch (err) {
        res.json({ succces: false, message: err })
    }
})


router.post('/command/add', (req, res, next) => {
    const { command, uid, email } = req.body
    try {
        const ref = db.ref('/users/' + uid + '/command')
        ref.set(command)
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