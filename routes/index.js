var express = require('express');
var router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('./firebaseConfig')
const db = firebase.database()

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Welcome to server' });
});

router.post('/commandUpdate', async (req, res, next) => {
  const { command, uid } = req.body
  try {
    const dbRef = db.ref('commands');
    const commands = await dbRef.once('value').then(snapshot => snapshot.val() || []);
    const commandToPush = { ...command, uid: uid }
    console.log(commandToPush)
    commands.push(commandToPush);
    await dbRef.set(commands);
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post('/discount', async (req, res, next) => {
  const { discountCode } = req.body
  try {
    const discountRef = db.ref('discount');
    await discountRef.once('value', (snapshot) => {
      const value = snapshot.val();
      const discount = value[discountCode] || 0;
      res.json({ succes: true, discount: discount })
    });
  } catch (err) {
    res.json({ succces: false, message: err })
  }
})

router.post(`/error`, async (req,res,next) => {
  const { email, error } = req.body
  try {
    console.log(email,error)
    const ref = db.ref('errors')
    await ref.push({email:email, error:error})
    res.json({success:true, message:'Problema a fost raportata cu succes'})
  }catch (err) {
    res.json({success:false, message:`Eroare: ${err.code}`})
  }
})


module.exports = router;
