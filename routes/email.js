var express = require('express');
var router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('./firebaseConfig')
const db = firebase.database()
const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKeyAuth = defaultClient.authentications['api-key'];
apiKeyAuth.apiKey = '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';
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()



router.post('/command', async (req, res, next) => {
  const { email, name, price } = req.body
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: email }];
    sendSmtpEmail.templateId = 2;
    sendSmtpEmail.params = { name: name, price: price };
    apiInstance.sendTransacEmail(sendSmtpEmail)
      .then((data) => {
        console.log('Email send succesfuly', data)
        res.json({ success: true, messages: `Email send succesfuly ${data}` })
      })
      .catch((error) => {
        console.log('Error sending email', error)
        res.json({succes:false, messages:`Error sending email:${error}`});
      });
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post('/newsLetter', async (req, res, next) => {
  const { email, name } = req.body
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: email }];
    sendSmtpEmail.templateId = 10;
    sendSmtpEmail.params = { name: name };
    apiInstance.sendTransacEmail(sendSmtpEmail)
      .then((data) => {
        console.log('Email send succesfuly', data)
        res.json({ success: true, messages: `Email send succesfuly ${data}` })
      })
      .catch((error) => {
        console.log('Error sending email', error)
        res.json({succes:false, messages:`Error sending email:${error}`});
      });
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

module.exports = router