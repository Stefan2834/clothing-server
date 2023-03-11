const express = require('express');
const router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('./firebaseConfigTest')
const auth  = firebase.auth()
const db = firebase.database()

router.get('/', (req,res,next) => {
  try {
    auth.onAuthStateChanged(user => {
      if(user) {
        res.json({user: user})
      }
      else res.json({error: 'You need to connect firstly'})
    })
  } catch(err) {
    res.json({user:err});
  }
})

router.post('/signUp',(req, res, next) => {
  const { email, password } = req.body;
  auth.createUserWithEmailAndPassword(email,password)
  .then(user => {
    res.json({success:true, message:'User created succesfuly', user:user})
  })
  .catch(err => {
    if (err.code === "auth/email-already-exists") {
      res.json({ success: false, message: "Email already in use" });
    } else {
      res.json({succes:false, message:err.message})
    }
  })
});

router.post('/login',(req,res,next) => {
  const { email, password } = req.body;
  auth.signInWithEmailAndPassword(email, password)
  .then((user) => {
    res.json({success:true, message: 'Login successful', user:user });
  })
  .catch((err) => {
    if(err.code === 'auth/wrong-password') {
      res.json({success:false, message:'Wrong Password'})
    } else if(err.code === 'auth/user-not-found') {
      res.json({success:false, message:'User not found'})
    } else {
      res.json({success:false, message:err.code})
    }
  });
})

router.post('/logout', (req,res,next) => {
  auth.signOut()
  .then(() => {
    res.json({success: true, message:'Logout succesfully'})
  })
  .catch(err => {
    res.json({success: false, message: err})
  })
})

router.post('/write', async (req,res,next) => {
  const { uid, password, email, name } = req.body;
  try {
    const ref = db.ref('/users/' + uid + '/');
    await ref.set({email:email, password: password,
      det:{info:'', tel:'', email:email, name:name}
    });
    res.json({success: true})
  } catch (err) {
    res.json({success: false, message:err})
  }
})



module.exports = router;
