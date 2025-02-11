const dotenv = require('dotenv');
dotenv.config({ path: 'C:\Users\rmisu\OneDrive\Desktop\api\outh2dev\oauth2_dev\.env' });
const { createTables, sequelize} = require('./dbconnect/post_database.js');

var path = require('path')
var config = require('./config.json')
var express = require('express')
var session = require('express-session')
var app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.json());  // This parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({secret: 'secret', resave: 'false', saveUninitialized: 'false'}))



// Initial view - loads Connect To QuickBooks Button
app.get('/', function (req, res) {
  res.render('home', config)
})

// Sign In With Intuit, Connect To QuickBooks, or Get App Now
// These calls will redirect to Intuit's authorization flow
app.use('/sign_in_with_intuit', require('./routes/sign_in_with_intuit.js'))
app.use('/connect_to_quickbooks', require('./routes/connect_to_quickbooks.js'))
app.use('/connect_handler', require('./routes/connect_handler.js'))

// Callback - called via redirect_uri after authorization
app.use('/callback', require('./routes/callback.js'))

// Connected - call OpenID and render connected view
app.use('/connected', require('./routes/connected.js'))

// Call an example API over OAuth2
app.use('/api_call', require('./routes/api_call.js'))

//call generic query
app.use('/queryGeneric', require('./routes/queryGeneric.js'));

//call query payment
app.use('/queryPayment', require('./routes/queryPayment.js'));

//post query payment to database
app.use('/postPayment', require('./routes/postPayment.js'));

//call query Invoice
app.use('/queryInvoice', require('./routes/queryInvoice.js'));

//post query payment to database
app.use('/postInvoice', require('./routes/postInvoice.js'));

//call query Deposit
app.use('/queryDeposit', require('./routes/queryDeposit.js'));

//call post Deposit to DB
app.use('/postDepositDB', require('./routes/postDepositDB.js'));

//post csv deposit file to quickbooks
app.use('/postDeposit', require('./routes/postDeposit.js'));

//post csv transfer file to quickbooks
app.use('/postTransfer', require('./routes/postTransfer.js'));

//post csv expense file to quickbooks
app.use('/postExpense', require('./routes/postExpense.js'));



// Start server on HTTP (will use ngrok for HTTPS forwarding)
app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
