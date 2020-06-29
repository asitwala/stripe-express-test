require('dotenv').config();
const express = require('express');
const querystring = require('querystring');

const { GoogleSpreadsheet } = require('google-spreadsheet');
var stripe = require('stripe')(process.env.STRIPE_API_KEY);

// spreadsheet key is the long id in the sheets URL
const doc = new GoogleSpreadsheet('1A65pgQyXCGh0n8Alp2R9rJirEQb7jFThB7I_amXl6PY');

// const STRIPE_API = require('../api/stripe-functions');
var router = express.Router();

router.get('/', async (req, res) => {
  res.render('onboarding.html');
});

router.get('/onboarding/setup', async (req, res) => {
  // Test client ID: ca_HYI7b0d1kneMHXpkggxRtkwrX1f5EdlB
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];
  const newRow = await sheet.addRow({ FV_Name: req.query.vessel, FV_User_Email: req.query.email });

  // // Reference: https://github.com/stripe/stripe-connect-rocketrides/blob/master/server/routes/pilots/stripe.js
  // // Generate a random string as `state` to protect from CSRF and include it in the session
  // req.session.state = Math.random()
  //   .toString(36)
  //   .slice(2);

  req.session.state = req.query.email;

  let parameters = {
    redirect_uri: 'http://localhost:3000/onboarding/complete',
    client_id: process.env.STRIPE_CLIENT_ID,
    state: req.session.state,
    'stripe_user[business_type]': 'company',
    'stripe_user[business_name]': req.query.vessel || undefined,
    'stripe_user[email]': req.query.email || undefined,
  };
  res.redirect(
    'https://connect.stripe.com/express/oauth/authorize' + '?' + querystring.stringify(parameters)
  );
});

router.get('/onboarding/complete', async (req, res) => {
   // Check the `state` we got back equals the one we generated before proceeding (to protect from CSRF)
   if (req.session.state != req.query.state) {
    return res.redirect('/');
  }

  const response = await stripe.oauth.token({
    grant_type: 'authorization_code',
    code: req.query.code,
  });

  const connected_account_id = response.stripe_user_id;

  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  const rowsLength = rows.length;

  for (var i = 0; i < rowsLength; i++) {
    if (rows[i].FV_User_Email === req.query.state) {
      rows[i].Stripe_Merchant_ID = connected_account_id;
      await rows[i].save(); // save changes
    }
  }

  res.render('onboardingComplete.html');
});


module.exports = router;
