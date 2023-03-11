const express = require('express');
const router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('./firebaseConfigTest')
const db = firebase.database()

router.post('/info', async (req,res,next) => {
    const { uid } = req.body;
    try {
        const detRef = db.ref('/users/' + uid + '/det/');
        detRef.once('value', (snapshot) => {
            const info = snapshot.val();
            res.json({det:info})
        });
    } catch (err) {
        res.json({succces:false, message:err})
    }
})

router.post('/infoUpdate', (req,res,next) => {
    const { det, uid } = req.body
    try {
        const ref = db.ref('/users/' + uid + '/det')
        ref.set({
            info:det.info,
            tel:det.tel,
            email:det.email,
            name:det.name
        })
        res.json({success: true})
    } catch (err) {
        res.json({success:false,message:err})
    }
})

module.exports = router;