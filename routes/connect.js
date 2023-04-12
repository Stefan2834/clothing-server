const express = require('express');
const router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('./firebaseConfig')
const auth = firebase.auth()
const db = firebase.database()


router.post('/signUp', (req, res, next) => {
  const { email, password } = req.body;
  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      userCredential.user.sendEmailVerification()
        .then(() => {
          console.log('Email verification link sent');
          res.json({ success: true, message: 'Utilizator creat', user: userCredential })
        })
        .catch((error) => {
          console.error('Error sending email verification link:', error);
          res.json({ success: false, message: error })
        });
    })
    .catch(err => {
      if (err.code === "auth/email-already-exists") {
        res.json({ success: false, message: "Email deja folosit" });
      } else {
        res.json({ success: false, message: err })
      }
    })
});


router.post('/login', (req, res, next) => {
  const { email, password } = req.body;
  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      if (userCredential.user.emailVerified) {
        const user = JSON.stringify(userCredential.user);
        res.cookie('userData', user, { maxAge: 10 * 365 * 24 * 60 * 60 * 1000, httpOnly: false, path:'/' });
        res.json({ success: true, message: 'Logat cu succes'});
      } else {
        res.json({ success: false, message: 'Contul nu este activat. Acceseaza emailul pentru a il activa' })
      }
    })
    .catch((err) => {
      console.log(err)
      if (err.code === 'auth/wrong-password') {
        res.json({ success: false, message: 'Parola sau emailul gresit' })
      } else if (err.code === 'auth/user-not-found') {
        res.json({ success: false, message: 'Acest cont nu exista' })
      } else {
        res.json({ success: false, message: err.code })
      }
    });
})

router.post('/logout', (req, res, next) => {
  auth.signOut()
  .then(() => {
      res.json({ success: true, message: 'Te-ai deconectat cu succes' })
    })
    .catch(err => {
      res.json({ success: false, message: err })
    })
})
router.get('/cookie', (req,res,next) => {
  try {
    res.clearCookie('userData')
  } catch (err) {
    res.json({success:false})
  }
})

router.post('/write', async (req, res, next) => {
  const { uid, password, email, name, type } = req.body;
  try {
    const ref = db.ref('/users/' + uid + '/');
    await ref.set({
      email: email, password: password,
      det: { info: '', tel: '', email: email, name: name, type: type }
    });
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})



module.exports = router;

