const express = require('express');
const router = express.Router();
const { Daily, Product } = require('./Schema')

router.get('/daily', async (req, res, next) => {
    try {
        const daily = await Daily.findOne({})
        const product = await Product.findOne({ id: daily.id })
        res.json({ daily: product })
    } catch (err) {
        res.json({ error: err })
    }
})

router.get('/discount', async (req, res, next) => {
    try {
        const product = await Product.findOne().sort({ discount: -1 }).limit(1);
        console.log(product)
        res.json({ discount: product })
    } catch (err) {
        res.json({ error: err })
    }
})

module.exports = router;