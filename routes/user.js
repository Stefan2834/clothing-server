const express = require('express');
const router = express.Router();
const { User, Ban, Admin, NewsLetter, Product, Order } = require('./Schema');

router.post('/info', async (req, res, next) => {
    const { uid, email } = req.body;
    try {
        const ban = await Ban.findOne({ email })
        if (ban) {
            res.json({ success: false, ban: true, reason: ban.reason })
        } else {
            const user = await User.findOne({ uid })
            const newCart = await Promise.all(user.cart.map(async (cartItem) => {
                const product = await Product.findOne({ id: cartItem.id });
                if (product.size[cartItem.selectedSize] === 0) {
                    await User.updateOne(
                        { uid: uid },
                        { $pull: { cart: { id: cartItem.id } } }
                    );
                    return null
                } else if (cartItem.number > product.size[cartItem.selectedSize]) {
                    await User.updateOne(
                        { uid: uid, 'cart.id': cartItem.id },
                        { $set: { 'cart.$.number': product.size[cartItem.selectedSize] } }
                    );
                    return { ...product.toObject(), selectedSize: cartItem.selectedSize, number: product.size[cartItem.selectedSize] }
                } else {
                    return { ...product.toObject(), selectedSize: cartItem.selectedSize, number: cartItem.number }
                }
            }));
            newCart.filter(data => data != null)
            const newFavorite = await Promise.all(user.favorite.map(async (favItem) => {
                return await Product.findOne({ id: favItem.id });
            }));
            let newsLetter
            const date = Number(user.det.newsLetter)
            if (date === 0) {
                newsLetter = 'off'
            } else if (date + (24 * 60 * 60 * 1000) < Date.now()) {
                newsLetter = 'on'
            } else {
                newsLetter = 'pending'
            }
            const data = {
                det: { ...user.det.toObject(), newsLetter: newsLetter },
                fav: newFavorite,
                cart: newCart,
                order: user.order ? user.order[user.order.length - 1] : {}
            }
            const admin = await Admin.findOne({ email })
            res.json({ success: true, data: data, ban: false, admin: admin ? true : false })
        }
    } catch (err) {
        console.log(err)
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
        await User.findOneAndUpdate({ uid }, { cart: newCart }, { new: true });
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
    const { uid, email, value, date } = req.body
    try {
        if (value) {
            await User.findOneAndUpdate({ uid }, { $set: { 'det.newsLetter': date } })
            const newNews = new NewsLetter({ email });
            await newNews.save();
        } else {
            await User.findOneAndUpdate({ uid }, { 'det.newsLetter': '0' })
            await NewsLetter.findOneAndDelete({ email });
        }
        res.json({ success: true })
    } catch (err) {
        res.json({ success: false })
    }
})


router.post('/orders', async (req, res, next) => {
    const { uid } = req.body
    try {
        const user = await User.findOne({ uid })
        res.json({ success: true, orders: user.order || [] })
    } catch (err) {
        res.json({ success: false })
    }
})

router.post(`/order/cancel`, async (req, res, next) => {
    const { uid, date } = req.body
    console.log(uid, date)
    try {
        await User.findOneAndUpdate(
            { uid: uid, 'order.date': date },
            { $set: { 'order.$.status': 'Se anulează' } },
            { new: true }
        );
        const orders = await Order.findOne({ date, uid })
        orders.status = 'Se anulează'
        await orders.save()
        res.json({ success: true })
    } catch (err) {
        res.json({ success: false, message: err })
    }
})

module.exports = router;