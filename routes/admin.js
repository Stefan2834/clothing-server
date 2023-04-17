const express = require('express');
const router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('./firebaseConfig')
const db = firebase.database()



router.get('/commands', async (req, res, next) => {
  try {
    const commandsRef = db.ref('commands');
    await commandsRef.once('value', (snapshot) => {
      const commands = snapshot.val();
      res.json({ succes: true, commands: commands })
    });
  } catch (err) {
    res.json({ succces: false, message: err })
  }
})

router.post('/commands', async (req, res, next) => {
  const { commands } = req.body
  try {
    const commandsRef = db.ref('commands')
    await commandsRef.set(commands)
  } catch (err) {
    req.json({ success: false, message: err })
  }
})

router.post(`/status`, async (req, res, next) => {
  const { uid, id, status } = req.body
  try {
    const ref = db.ref('users/' + uid + '/command/' + id + '/status/')
    await ref.set(status)
    res.json({ succes: true })
  } catch (err) {
    res.json({ succes: false, message: err })
  }
})

router.get('/errors', async (req, res, next) => {
  try {
    const ref = db.ref('errors')
    ref.once('value', (snapshot) => {
      const errors = snapshot.val();
      console.log(errors);
      res.json({ success: true, errors: errors })
    });
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.delete('/errors', async (req, res, next) => {
  const { id } = req.body
  try {
    const ref = db.ref('errors');
    ref.once('value', snapshot => {
      const errors = snapshot.val() || []
      errors.splice(id, 1)
      console.log(errors)
      ref.set(errors);
    })
    res.json({ success: true, message: 'Error deleted successfully' });
  } catch (err) {
    res.json({ success: false, message: err });
  }
});
module.exports = router;
