var express = require('express');
var router = express.Router();
require('dotenv').config();
const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKeyAuth = defaultClient.authentications['api-key'];
apiKeyAuth.apiKey = process.env.API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
const { NewsLetter } = require('./Schema')


const sendEmail = (id, to, params) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.templateId = id;
  sendSmtpEmail.params = { ...params };
  apiInstance.sendTransacEmail(sendSmtpEmail)
    .then((data) => {
      console.log('Email send succesfuly', data)
      return true
    })
    .catch((error) => {
      console.log('Error sending email', error)
      return false
    });
}

router.post('/order', (req, res, next) => {
  const { email, name, price } = req.body
  try {
    const send = sendEmail(12, email, { name: name, price: price })
    if (send) {
      res.json({ success: true, messages: `Email send succesfuly ${data}` })
    } else {
      res.json({ success: false, messages: `Error sending email:${error}` });
    }
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post('/newsLetter', async (req, res, next) => {
  const { email, name } = req.body
  try {
    const send = sendEmail(14, email, { name: name })
    if (send) {
      res.json({ success: true, messages: `Email send succesfuly` })
    } else {
      res.json({ success: false, messages: `Error sending email` });
    }
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post('/error', (req, res, next) => {
  const { name, solve, error } = req.body
  try {
    const send = sendEmail(13, name, { name: name, solve: solve, error: error })
    if (send) {
      res.json({ success: true, messages: `Email send succesfuly` })
    } else {
      res.json({ success: false, messages: `Error sending email` });
    }
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post(`/reviewDeleted`, async (req, res, next) => {
  const { id, email, reason } = req.body
  try {
    const send = sendEmail(13, email, { reason: reason, id: id })
    if (send) {
      res.json({ success: true, messages: `Email send succesfuly` })
    } else {
      res.json({ success: false, messages: `Error sending email` });
    }
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post(`/status`, async (req, res, next) => {
  const { status, email, nr } = req.body
  console.log(status, email, nr)
  try {
    let temId = 0;
    if (status === 'Anulată') {
      temId = 17;
    } else if (status === 'Se livrează') {
      temId = 18;
    } else if (status === 'Livrată') {
      temId = 16;
    }
    if (temId !== 0) {
      const send = sendEmail(temId, email, { name: email, nr: nr })
      if (send) {
        res.json({ success: true, messages: `Email send succesfuly` })
      } else {
        res.json({ success: false, messages: `Error sending email` });
      }
    }
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

async function sendNewsLetterEmail(templateId, params) {
  try {
    const newsValue = await NewsLetter.find({}, { email: 1 });
    newsValue.forEach(email => {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.to = [{ email: email.email }];
      sendSmtpEmail.templateId = templateId;
      sendSmtpEmail.params = { ...params };
      apiInstance.sendTransacEmail(sendSmtpEmail)
        .then((data) => {
          console.log('Email send succesfuly', data)
        })
        .catch((error) => {
          console.log('Error sending email', error)
        });
    })
  } catch (err) { console.error(err) }
}


module.exports = {
  emailRoute: router,
  sendNewsLetterEmail: sendNewsLetterEmail
}