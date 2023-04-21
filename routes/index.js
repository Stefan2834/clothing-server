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
    commands.push(commandToPush);
    await dbRef.set(commands);
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post('/discount', async (req, res, next) => {
  const { discountCode, email } = req.body;
  try {
    const discountRef = db.ref(`discount/${discountCode}`);
    const snapshot = await discountRef.once('value');
    const discount = snapshot.val();

    if (!discount) {
      res.json({ success: false, message: "Codul este gresit sau a expirat" });
      return;
    }

    const oldUser = Object.values(discount.user || []);
    if (oldUser.includes(email)) {
      res.json({ success: false, message: 'Ai mai folosit acest cod' });
      return;
    } else {
      res.json({ success: true, discount: discount.value });
      return
    }

  } catch (err) {
    res.json({ success: false, message: err.code });
  }
});

router.post('/discountOnce', async (req, res, next) => {
  const { email, code } = req.body
  try {
    console.log(code)
    const discountRef = db.ref('discount/' + code + '/user/')
    discountRef.push(email)
  } catch (err) {

  }
})

router.post(`/error`, async (req, res, next) => {
  const { email, error } = req.body
  try {
    console.log(email, error)
    const ref = db.ref('errors')
    ref.once('value', snapshot => {
      const errors = snapshot.val() || []
      errors.push({ email: email, error: error })
      ref.set(errors)
    })
    res.json({ success: true, message: 'Problema a fost raportata cu succes' })
  } catch (err) {
    res.json({ success: false, message: `Eroare: ${err.code}` })
  }
})


module.exports = router;
