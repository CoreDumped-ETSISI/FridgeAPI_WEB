# Fridge API

[![Dependencies Status][npm-image]][npm-url]

A RESTful API with web for the "Fridge Store" management in the [CoreDumped](http://coredumped.es/) association.

## Install

```
git clone https://github.com/CoreDumped-ETSISI/FridgeAPI_WEB.git
cd FridgeAPI_WEB
npm install
```
## Usage

In order to run this project, a JS file is missing: config.js
This file must be created and configured manually with the parameters described below:
module.exports = {

    SO: "YOUR_OPERATIVE_SYSTEM",

    HOST: "YOUR_HOST",
    PORT: "DESIRED_PORT",

    TZ: "YOUR_TIMEZONE",

    DB_USER: "YOUR_DATABASE_USER",
    DB_PASS: "YOUR_DATABASE_PASS",
    DB_NAME: "DATABASE_NAME",
    MONGODB: "URL_TO_MONGODB_INSTANCE",

    BK_DIR: "./backups", //leave this as it is
    LOG_DIR: "./logs",   //leave this as it is

    USER_IMAGES_PATH: '/images/userImages/',  //leave this as it is
    PRODUCTS_IMAGES_PATH: '/images/products/',    //leave this as it is
    OFFERS_IMAGES_PATH: '/images/offers/',    //leave this as it is
    DEFAULT_PRODUCT_IMAGE: '/images/default-product-image.jpg',    //leave this as it is
    DEFAULT_USER_IMAGE: '/images/avatar.png',     //leave this as it is

    SECRET_TOKEN: 'YOUR_SECRET_TOKEN',
    EXP_DAYS: EXPIRATION_DAYS_FOR_TOKEN,

    RESTORE_PASS_EXP: VALID_URL_TIME_FOR_PASSWORD_RESTORE,     //hours
    VERIFY_EMAIL_EXP: VALID_EMAIL_TIME_FOR_ACCOUNT_VERIFIAL,     //hours
    EMAIL_VERIFICATION: (true, false) ALLOW_EMAIL_VERIFICATION,

    ALGORITHM: 'YOUR_ENCRYPTION_ALGORYTHM',
    PASSWORD: 'DESIRED_ALGORYTHM_PASSWORD',
    KEY: 'ALGORYTHM_KEY',
    IV: 'ALGORYTHM_IV',

    ADMIN_USER: 'ADMIN_EMAIL_ACCOUNT',
    ADMIN_PASS: 'ADMIN_EMAIL_PASSWORD',
    ADMIN_TOKEN: 'ADMIN_TOKEN_SEED',

    MAIL_USER: 'ADMIN_USER_ACCESS_ACCOUNT',
    SENDGRID_API_KEY: 'DESIRED_SENDGRID_API_KEY',

    PASS_MIN_LENGTH: MIN_PASS_LENGHT,
    PASS_MAX_LENGTH: MAX_PASS_LENGHT,

    MAX_MB_IMAGE_SIZE: MAX_IMAGES_SIZE,

    PROFIT: PROFIT_MULTIPLIER
};

## Run

```
npm start
```

## License

[MIT](http://vjpr.mit-license.org)

[npm-image]: https://david-dm.org/CoreDumped-ETSISI/FridgeAPI_WEB.svg
[npm-url]: https://github.com/CoreDumped-ETSISI/FridgeAPI_WEB/network/dependencies
