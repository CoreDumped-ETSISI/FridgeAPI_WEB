'use strict';

const User = require('../models/user');
const config = require('../config');

function isAdmin(req, res, next) {
    User.findOne({_id: req.user})
        .select('+admin')
        .exec((err, user) => {
            if (err) res.status(500).send({ message: 'Internal error'});
            if (!user) res.status(401).send({ message: 'Unauthorized'});

            if (user.admin === config.ADMIN_TOKEN) {
                next()
            } else {
                res.status(401).send({ message: 'Unauthorized'});
            }
        })
}

module.exports = isAdmin;
