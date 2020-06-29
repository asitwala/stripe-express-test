require('dotenv').config();
const express = require('express');
const querystring = require('querystring');
// const STRIPE_API = require('../api/stripe-functions');
var router = express.Router();

router.get('/', async (req, res) => {
  res.render('onboarding.html');
});

router.get('/onboarding/setup', async (req, res) => {
  // Test client ID: ca_HYI7b0d1kneMHXpkggxRtkwrX1f5EdlB

  // Reference: https://github.com/stripe/stripe-connect-rocketrides/blob/master/server/routes/pilots/stripe.js
  // Generate a random string as `state` to protect from CSRF and include it in the session
  req.session.state = Math.random()
    .toString(36)
    .slice(2);

  let parameters = {
    redirect_uri: 'https://connect.stripe.com/connect/default/oauth/test',
    client_id: process.env.STRIPE_CLIENT_ID,
    state: req.session.state,
  };
  res.redirect(
    'https://connect.stripe.com/express/oauth/authorize' + '?' + querystring.stringify(parameters)
  );
});

router.get('/onboarding/complete', async (req, res) => {
  res.render('onboardingComplete.html');
});

// router.post('/register', (req, res) => {
//   const plan = JSON.parse(req.body.plan);
//   plan.formatted = req.body.plan;

//   res.render('register.html', {
//     productName: req.body.productName,
//     plan,
//   });
// });


// router.post('/handlePayment', async (req, res) => {
//   const parsedPlan = JSON.parse(req.body.plan);

//   const customerInfo = {
//     name: req.body.name,
//     email: req.body.email,
//     planId: parsedPlan.id,
//   };

//   const subscription = await STRIPE_API.createCustomerAndSubscription(
//     req.body.paymentMethodId,
//     customerInfo,
//   );

//   return res.json({ subscription });
// });

module.exports = router;
