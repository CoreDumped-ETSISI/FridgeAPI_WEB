const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const express = require('express');
const path = require('path');
const sassMiddleware = require('node-sass-middleware');

const logger = require('./services/logger');
require('./services/backup'); //This activate the automatic backups


const routes = require('./routes');
const webRoutes = require('./routes/webRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const userRoutes = require('./routes/userRoutes');
const utilRoutes = require('./routes/utilityRoutes');

const app = express();

// logger(app);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));
logger(app);

app.use('/', routes);
app.use('/', webRoutes);
app.use('/admin', adminRoutes);
app.use('/product', productRoutes);
app.use('/payment', paymentRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/user', userRoutes);
app.use('/util', utilRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
