const express = require('express');
const router = express.Router();
const { Daily } = require('./Schema')

router.get('/daily', async (req, res, next) => {
    try {
        const daily = await Daily.find({})
        res.json({ data: daily[0].id })
    } catch (err) {
        res.json({ error: err })
    }
})

module.exports = router;