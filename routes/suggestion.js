const express = require('express');
const router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('./firebaseConfig')
const auth  = firebase.auth()
const db = firebase.database()

router.get('/daily', (req,res,next) => {
    try {
        dailyRef = db.ref('/dailyProduct')
        dailyRef.once('value', (snapshot) => {
            const daily = snapshot.val()
            res.json({data:daily})
        })
    } catch (err) {
        res.json({error:err})
    }
})

module.exports = router;