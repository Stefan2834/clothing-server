const express = require('express');
const router = express.Router();
const { Daily, Product } = require('./Schema')

router.get('/daily', async (req, res, next) => {
    try {
        const daily = await Daily.findOne({})
        const man = await Product.findOne({ id: daily.man })
        const woman = await Product.findOne({ id: daily.woman })
        res.json({ man: man, woman: woman })
    } catch (err) {
        res.json({ error: err })
    }
})

router.get('/discount', async (req, res, next) => {
    try {
        const man = await Product.findOne({ type: { $regex: /barbati/i } }).sort({ discount: -1, price: -1 }).limit(1);
        const woman = await Product.findOne({ type: { $regex: /femei/i } }).sort({ discount: -1, price: -1 }).limit(1);
        res.json({ man, woman })
    } catch (err) {
        res.json({ error: err })
    }
})

module.exports = router;