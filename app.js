var express = require('express');
var path = require('path');
const bodyParser = require('body-parser')
const session = require('express-session')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const template = require('art-template')
const dateFormat = require('dateformat')

var homeRouter = require('./routes/home');
var adminRouter = require('./routes/admin');

var app = express();

require('./model/connect')
require('./model/user')

app.use(session({
	secret: 'secret key',
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 30 * 24 * 60 * 1000
	}
}))

app.use(bodyParser.urlencoded({extended: false}))

app.engine('art', require('express-art-template'))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'art')
template.defaults.imports.dateFormat = dateFormat

app.use(logger('dev'));
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', require('./middleware/loginGuard'))

app.use('/', homeRouter);
app.use('/admin', adminRouter);

app.use((err, req, res, next) => {
	let result = JSON.parse(err)
	let params = []

	for (let attr in result) {
	  if (attr != 'path') {
	    params.push(attr + '=' + result[attr])
	  }
	}
	res.redirect(`${result.path}?${params.join('&')}`)
})
module.exports = app;
