'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OfferSchema = Schema({
    name: String,
    price: Number,
    image: String,
    products: { type: [Schema.Types.ObjectId], ref: 'Product' },
}, {versionKey: false});

module.exports = mongoose.model('Offer', OfferSchema);
