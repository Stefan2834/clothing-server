const express = require('express');
const router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('./firebaseConfig')
const auth = firebase.auth()
const db = firebase.database()

router.get('/admin', async (req, res, next) => {
  try {
    auth.onAuthStateChanged(function (user) {
      if (user) {
        res.json({ success: true, messages: 'Connected' })
      } else {
        res.json({ success: false, message: 'You are not connected' })
      }
    })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

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
      if (err.code === "auth/email-already-in-use") {
        res.json({ success: false, message: "Email deja folosit" });
      } else {
        res.json({ success: false, message: err.code })
      }
    })
});


router.post('/login', (req, res, next) => {
  const { email, password } = req.body;
  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      if (userCredential.user.emailVerified) {
        const user = userCredential.user;
        res.json({ success: true, message: 'Logat cu succes', user: user });
      } else {
        res.json({ success: false, message: 'Contul nu este activat. Accesează emailul pentru a îl activa' })
      }
    })
    .catch((err) => {
      console.log(err)
      if (err.code === 'auth/wrong-password') {
        res.json({ success: false, message: 'Parola sau emailul greșit' })
      } else if (err.code === 'auth/user-not-found') {
        res.json({ success: false, message: 'Acest cont nu există' })
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

router.post('/reset', async (req, res, next) => {
  const { email } = req.body
  try {
    await auth.sendPasswordResetEmail(email);
    res.json({ success: true, message: `Emailul a fost trimis la ${email}` })
  } catch (err) {
    if (err.code === 'auth/invalid-email') {
      res.json({ success: false, message: 'Emailul este invalid' })
    } else {
      res.json({ success: false, message: err.code })
    }
  }
})
router.post('/resendEmail', async (req, res, next) => {
  const { email, password } = req.body
  await auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      userCredential.user.sendEmailVerification()
        .then(() => {
          console.log('Email verification link sent');
          res.json({ success: true, message: 'Email trimis cu succes' })
        })
        .catch((error) => {
          console.error('Emailul nu a putut fi trimis:', error);
          res.json({ success: false, message: error })
        });
    }).catch(err => {
      if (err.code === 'auth/user-not-found') {
        res.json({ success: false, message: 'Utilizatorul nu există' })
      } else if (err.code === 'auth/wrong-password') {
        res.json({ success: false, message: 'Parola este greșită' })
      } else {
        res.json({ success: false, message: err.code })
      }
    })
})


router.post('/write', async (req, res, next) => {
  const { uid, password, email, name, type } = req.body;
  try {
    const ref = db.ref('/users/' + uid + '/');
    await ref.set({
      email: email, password: password,
      det: { info: '', tel: '', email: email, name: name, type: type, newsLetter: false, county: '', color: "#2289FF" }
    });
    res.json({ success: true })
  } catch (err) {
    res.json({ success: false, message: err })
  }
})



module.exports = router;

