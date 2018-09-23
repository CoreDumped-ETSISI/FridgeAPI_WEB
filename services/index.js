'use strict';

const crypto = require('crypto');
const config = require('../config');

function encrypt(text) {
    const iv  = Buffer.from(config.IV, 'hex');
    const cipher = crypto.createCipheriv(config.ALGORITHM, config.KEY, iv);
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    const iv  = Buffer.from(config.IV, 'hex');
    const decipher = crypto.createDecipheriv(config.ALGORITHM, config.KEY, iv);
    let dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}


function calcPrice(marketPrice) {
    const price = (marketPrice * config.PROFIT) * 100;
    return (price + ((5 - (price % 5)) % 5)) / 100;
}

function normEmail(email) {
    return email.toLowerCase();
}

function isAdmin(user) {
    return user.admin === config.ADMIN_TOKEN
}

function countOccurrences(obj, list) {
    let count = 0;
    for (let i = 0; i < list.length; i++) {
        if (''+obj === ''+list[i])
            count++
    }
    return count
}

module.exports = {
    encrypt,
    decrypt,
    calcPrice,
    normEmail,
    isAdmin,
    countOccurrences
};
