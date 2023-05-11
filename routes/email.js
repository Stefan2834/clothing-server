var express = require('express');
var router = express.Router();
const firebase = require('firebase');
const firebaseConfig = require('./firebaseConfig')
const db = firebase.database()
const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKeyAuth = defaultClient.authentications['api-key'];
apiKeyAuth.apiKey = process.env.API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()



router.post('/order', async (req, res, next) => {
  const { email, name, price } = req.body
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: email }];
    sendSmtpEmail.templateId = 12;
    sendSmtpEmail.params = { name: name, price: price };
    apiInstance.sendTransacEmail(sendSmtpEmail)
      .then((data) => {
        console.log('Email send succesfuly', data)
        res.json({ success: true, messages: `Email send succesfuly ${data}` })
      })
      .catch((error) => {
        console.log('Error sending email', error)
        res.json({ success: false, messages: `Error sending email:${error}` });
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
    sendSmtpEmail.templateId = 14;
    sendSmtpEmail.params = { name: name };
    apiInstance.sendTransacEmail(sendSmtpEmail)
      .then((data) => {
        console.log('Email send succesfuly', data)
        res.json({ success: true, messages: `Email send succesfuly ${data}` })
      })
      .catch((error) => {
        console.log('Error sending email', error)
        res.json({ success: false, messages: `Error sending email:${error}` });
      });
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post('/error', (req, res, next) => {
  const { name, solve, error } = req.body
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: name }];
    sendSmtpEmail.templateId = 13;
    sendSmtpEmail.params = { name: name, solve: solve, error: error };
    apiInstance.sendTransacEmail(sendSmtpEmail)
      .then((data) => {
        console.log('Email send succesfuly', data)
        res.json({ success: true, messages: `Email send succesfuly ${data}` })
      })
      .catch((error) => {
        console.log('Error sending email', error)
        res.json({ success: false, messages: `Error sending email:${error}` });
      });
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post(`/reviewDeleted`, async (req, res, next) => {
  const { id, email, reason } = req.body
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: email }];
    sendSmtpEmail.templateId = 15;
    sendSmtpEmail.params = { reason: reason, id: id };
    apiInstance.sendTransacEmail(sendSmtpEmail)
      .then((data) => {
        console.log('Email send succesfuly', data)
        res.json({ success: true, messages: `Email send succesfuly ${data}` })
      })
      .catch((error) => {
        console.log('Error sending email', error)
        res.json({ success: false, messages: `Error sending email:${error}` });
      });
  } catch (err) {
    res.json({ success: false, message: err })
  }
})
module.exports = router