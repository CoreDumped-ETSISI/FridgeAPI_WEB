'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PurchaseSchema = Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'user', required: true, select: false},
    amount: Number,
    productList: [{
        _id: false,
        product: {},
        quantity: Number
    }],
    timestamp: {type: Date, default: Date.now()}
}, {versionKey: false});

module.exports = mongoose.model('Purchase', PurchaseSchema);
