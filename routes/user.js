const express = require('express');
const router = express.Router();
const { User, Ban, Admin, NewsLetter, Product } = require('./Schema');

router.post('/info', async (req, res, next) => {
    const { uid, email } = req.body;
    try {
        const ban = await Ban.findOne({ email })
        if (ban) {
            res.json({ success: false, ban: true, reason: ban.reason })
        } else {
            const user = await User.findOne({ uid })
            console.log(uid, user)
            const data = {
                det: user.det,
                fav: user.favorite,
                cart: user.cart,
                order: user.order
            }
            const admin = await Admin.findOne({ email })
            res.json({ success: true, data: data, ban: false, admin: admin ? true : false })
        }
    } catch (err) {
        res.json({ succces: false, message: err })
    }
})

router.post('/infoUpdate', async (req, res, next) => {
    const { det, uid } = req.body
    try {
        await User.findOneAndUpdate({ uid }, { det }, { new: true });
        res.json({ success: true })
    } catch (err) {
        res.json({ success: false, message: err })
    }
})

router.post('/favorite/add', async (req, res, next) => {
    const { favorite, uid } = req.body
    try {
        const newFavorite = favorite.map(fav => { return { id: fav.id } })
        // const ref = db.ref('/users/' + uid + '/favorite')
        // ref.set(newFavorite)
        await User.findOneAndUpdate({ uid }, { favorite: newFavorite }, { new: true });
        res.json({ success: true })
    } catch (err) {
        res.json({ success: false, message: err })
    }
})

router.post('/cart/add', async (req, res, next) => {
    const { cart, uid } = req.body
    try {
        const newCart = cart.map(cart => {
            return { id: cart.id, selectedSize: cart.selectedSize, number: cart.number }
        })
        // const ref = db.ref('/users/' + uid + '/cart')
        // ref.set(newCart)
        await User.findOneAndUpdate({ uid }, { cart: newCart }, { new: true });
        res.json({ success: true })
    } catch (err) {
        res.json({ success: false, message: err })
    }
})

router.post('/order/add', async (req, res, next) => {
    const { order, uid } = req.body
    try {
        // const ref = db.ref('/users/' + uid + '/order')
        // ref.set(order)
        await User.findOneAndUpdate({ uid }, { order: order }, { new: true });
        res.json({ success: true })
    } catch (err) {
        res.json({ success: false, message: err })
    }
})

router.post('/product', async (req, res, next) => {
    const { product } = req.body
    try {
        const newProduct = Object.values(product)
        for (const productData of newProduct) {
            const product = new Product(productData);
            await product.save();
        }
        res.json({ success: true })
    } catch (err) {
        res.json({ success: false, message: err })
    }
})

router.post('/newsLetter', async (req, res, next) => {
    const { email, value } = req.body
    try {
        if (value) {
            const newNews = new NewsLetter({ email });
            await newNews.save();
        } else {
            await NewsLetter.findOneAndDelete({ email });
        }
        res.json({ success: true })
    } catch (err) {
        res.json({ success: true })
    }
})

module.exports = router;