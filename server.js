var google = require('googleapis');
var sheets = google.sheets('v4');
var plus = google.plus('v1');
var Tracker = require('./tracker.js');
var tracker = new Tracker();
//var userName;
//var dataDeets;

// Environment variables that we set after obtaining them from the Google console
var clientID = process.env.CLIENT_ID;
var clientSecret = process.env.CLIENT_SECRET;
// The URL that the Google will redirect to after it attempts to authenticate the user
var callbackURL = 'https://'+process.env.PROJECT_DOMAIN+'.glitch.me/login/google/return';
// We are asking Google for permission to use Sheets and Plus
var scopes = ['https://www.googleapis.com/auth/spreadsheets',
              'https://www.googleapis.com/auth/plus.login'];
// Create the oauth client + the return URL after authentication is attempted
var oauth2Client = new google.auth.OAuth2(clientID, clientSecret, callbackURL);

var url = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'online',
  // If you only need one scope you can pass it as a string
  scope: scopes
});

// Initialize the web application
var express = require('express');
var app = express();
var expressSession = require('express-session');

// Cookies are used to save authentication
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
app.use(express.static('views'))
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(expressSession({ secret:'watchingmonkeys', resave: true, saveUninitialized: true }));

// Index route
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// On clicking "logoff" the cookie is cleared
app.get('/logoff',
  function(req, res) {
    res.clearCookie('google-auth');
    res.redirect('/');
  }
);

// User clicks the link to here which will use the Google authenticator
app.get('/auth/google', function(req, res) {
  res.redirect(url);
});

// The authenticator will return the user here w/success or failure
app.get('/login/google/return', function(req, res) {
    oauth2Client.getToken(req.query.code, function (err, tokens) {
      // Tokens contains an access_token and a refresh_token if you set access type to offline. Save them.
      if (!err) {
        oauth2Client.setCredentials({
          access_token: tokens.access_token
        });
        res.redirect('/setcookie');
      } else {
        console.log("Aww, man: " + err);
      }
    });
  }
);

// on successful auth, a cookie is set before redirecting
// to the success view
app.get('/setcookie',
  function(req, res) {
    res.cookie('google-auth', new Date());
    res.redirect('/app');
  }
);

// if cookie exists, success. otherwise, user is redirected to index
app.get('/app',
  function(req, res) {
    if(req.cookies['google-auth']) {
      res.sendFile(__dirname + '/views/app.html');
    } else {
      res.redirect('/');
    }
  }
);

app.get('/updatesheet', function(req, res){
  tracker.retrieveRows(req.query.type, process.env.SHEET_KEY, oauth2Client)
    .then((data) => {
      if(!data){
        data = []; //No data instead of undefined
      }
      return tracker.appendTimeStamp(req.query.type, data, process.env.SHEET_KEY, oauth2Client);
    })
    .then(() => {
      res.sendStatus(200); //success
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(400); //bad request
    });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
