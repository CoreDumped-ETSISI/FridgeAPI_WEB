'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'user', required: true},
    adminId: {type: Schema.Types.ObjectId, ref: 'user', required: true, select: false},
    amount: Number,
    timestamp: {type: Date, default: Date.now()}
}, {versionKey: false});

module.exports = mongoose.model('Payment', PaymentSchema);
