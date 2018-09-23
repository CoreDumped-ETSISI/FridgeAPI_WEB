'use strict';

const token = require('../services/token');
const User = require('../models/user');
const config = require('../config');



function isAuth(req, res, next) {
    if (req.cookies && req.cookies.token) {
        req.headers.authorization = "Bearer " + req.cookies.token;
    }

    if (!req.headers.authorization) {
        return res.status(401).send({ message: 'Unauthorized'});
    }

    const tokenReq = req.headers.authorization.split(" ")[1];

    token.decode(tokenReq)
        .then(response => {
            User.findOne({_id: response})
                .exec((err, user) => {
                    if (err) return res.status(500).send({ message: 'Internal error'});
                    if (!user) return res.status(401).send({ message: 'Unauthorized'});
                    if (config.EMAIL_VERIFICATION && user.status !== 'Verified') return res.status(401).send({ message: 'Unauthorized'});

                    req.user = response;
                    next()
                })
        })
        .catch(response => {
            return res.status(401).send({ message: 'Unauthorized'});
        })
}

module.exports = isAuth;
