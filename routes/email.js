var express = require('express');
var router = express.Router();
const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKeyAuth = defaultClient.authentications['api-key'];
require('dotenv').config();
apiKeyAuth.apiKey = process.env.API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
const { NewsLetter, User } = require('./Schema');




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

router.post('/order', findNameByEmail, (req, res, next) => {
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

router.post('/error', findNameByEmail, (req, res, next) => {
  const { name, email, solve, error } = req.body
  try {
    const send = sendEmail(13, email, { name: name, solve: solve, error: error })
    if (send) {
      res.json({ success: true, messages: `Email send succesfuly` })
    } else {
      res.json({ success: false, messages: `Error sending email` });
    }
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post(`/reviewDeleted`, findNameByEmail, async (req, res, next) => {
  const { id, email, reason, name } = req.body
  try {
    const send = sendEmail(15, email, { reason: reason, id: id, name: name })
    if (send) {
      res.json({ success: true, messages: `Email send succesfuly` })
    } else {
      res.json({ success: false, messages: `Error sending email` });
    }
  } catch (err) {
    res.json({ success: false, message: err })
  }
})

router.post(`/status`, findNameByEmail, async (req, res, next) => {
  const { status, email, name } = req.body
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
      const send = sendEmail(temId, email, { name: name })
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

async function findNameByEmail(req, res, next) {
  const { email } = req.body
  try {
    const user = await User.findOne({ email })
    if (user) {
      req.body.email = user.det.email
      req.body.name = user.det.name
    } else {
      req.body.name = email
      req.body.email = email
    }
    next()
  } catch (err) {
    res.json({ success: false, message: err })
  }
}

async function sendNewsLetterEmail(templateId, params) {
  try {
    const newsValue = await NewsLetter.find({}, { email: 1 });
    newsValue.forEach(async email => {
      const user = await User.findOne({ email: email.email })
      const name = user.det.name
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.to = [{ email: email.email }];
      sendSmtpEmail.templateId = templateId;
      sendSmtpEmail.params = { ...params, name };
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
  sendNewsLetterEmail,
}