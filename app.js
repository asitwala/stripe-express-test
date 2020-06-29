const express = require('express');
const nunjucks = require('nunjucks');

var session = require('express-session')
const app = express();
const router = require('./router');
const port = 3000;

/* Set up Express to serve HTML files using 'res.render' with the help of Nunjucks */
app.set('view engine', 'html');
app.engine('html', nunjucks.render);
nunjucks.configure('views', { noCache: true });

/* To host CSS from the server */
app.use(express.static(__dirname));
app.use('/styles', express.static('styles'));

/* To use 'req.body' -- to parse 'application/json' content-type */
app.use(express.json()); 

/* To use 'req.body' -- to parse 'application/x-www-form-urlencoded' content-type */
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "sessionSecret2147",
    resave: false,
    saveUninitialized: true,
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    maxAge: 30 * 60 * 1000,
    cookie: { maxAge: 30 * 60 * 1000 }
  })
);

/* Set up router */
app.use('/', router);

app.listen(port, () => {
  console.info(`Stripe Express demo running on port ${port}`);
});
