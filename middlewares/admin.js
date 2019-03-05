'use strict';

const User = require('../models/user');
const config = require('../config');

const rtn = require('./apiResults');

function isAdmin(req, res, next) {
    User.findOne({_id: req.user})
        .select('+admin')
        .exec((err, user) => {
            if (err) rtn.intrServErr(res);
            if (!user) res.status(401).send({ message: 'Unauthorized'});

            if (user.admin === config.ADMIN_TOKEN) {
                next()
            } else {
                res.status(401).send({ message: 'Unauthorized'});
            }
        })
}

module.exports = isAdmin;
