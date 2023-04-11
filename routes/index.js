var express = require('express');
var router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('./firebaseConfig')
const db = firebase.database()
const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKeyAuth = defaultClient.authentications['api-key'];
apiKeyAuth.apiKey = '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';
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Welcome to server' });
});

router.post('/commandUpdate', async (req, res, next) => {
  const { command, uid, email } = req.body
  try {
    const dbRef = db.ref('commands');
    const commands = await dbRef.once('value').then(snapshot => snapshot.val() || []);
    const commandToPush = { ...command, uid: uid }
    commands.push(commandToPush);
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: email }];
    sendSmtpEmail.templateId = 2;
    sendSmtpEmail.params = { name: command.details.name, price:command.price.total };
    apiInstance.sendTransacEmail(sendSmtpEmail)
      .then((data) => {
        console.log('Email sent successfully:', data);
      })
      .catch((error) => {
        console.error('Error sending email:', error);
      });
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
module.exports = router;
