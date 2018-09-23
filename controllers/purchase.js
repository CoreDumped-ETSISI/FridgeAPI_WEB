'use strict';

const services = require('../services');
const input = require('../services/inputValidators');
const Purchase = require('../models/purchase');
const Product = require('../models/product');
const User = require('../models/user');

function getPurchase(req, res) {
    let purchaseId = req.params.id;
    if (!input.validId(purchaseId)) return res.sendStatus(400);

    Purchase.findOne({_id: purchaseId, userId: req.user})
        .select("-userId")                   //TODO: Overwrite function toJSON to avoid this
        .exec((err, purchase) => {
            if (err) return res.sendStatus(500);
            if (!purchase) return res.sendStatus(404);
            return res.status(200).send(purchase)
        })
}

function getPurchaseList(req, res) {
    Purchase.find({userId: req.user})
        .select("-userId")
        .sort({ timestamp: -1 })
        .exec((err, purchases) => {
            if (err) return res.sendStatus(500);
            if (!purchases || purchases.length === 0) return res.sendStatus(404);
            return res.status(200).send(purchases)
        })
}

function getPurchaseListAll(req, res) {
    Purchase.find({}, (err, purchases) => {
        if (err) return res.sendStatus(500);
        if (!purchases || purchases.length === 0) return res.sendStatus(404);
        return res.status(200).send(purchases)
    })
}

function savePurchase(req, res) {
    if (!req.body.productList) return res.sendStatus(400);
    let idList = req.body.productList.split(",");
    Product.find({_id: {$in: idList}})
        .exec(function (err, products) {
            if (err) return res.sendStatus(500);
            if (!products || products.length === 0) return res.sendStatus(404);
            let amount = 0;
            let productList = [];
            for (let x = 0; x < products.length; x++) {
                let count = services.countOccurrences(products[x]._id, idList);
                if (count > products[x].stock) {
                    return res.sendStatus(400)
                }
                amount += products[x].price * count;
                productList.push({product: products[x], quantity: count})
            }
            if (amount < 0.01) return res.sendStatus(400);
            const purchase = new Purchase({
                userId: req.user,
                amount: amount,
                productList: productList
            });

            User.findOne({_id: req.user})
                .exec((err, user) => {
                    if (err) return res.sendStatus(500);
                    if (!user) return res.sendStatus(404);
                    if (user.balance - amount < -0.009) return res.sendStatus(402);

                    purchase.save((err, purchaseStored) => {
                        if (err) return res.sendStatus(500);

                        user.update({$inc: {balance: -amount}}, (err, userStored) => {
                            if (err) return res.sendStatus(500);

                            for (let x = 0; x < products.length; x++) {
                                const count = services.countOccurrences(products[x]._id, idList);
                                products[x].update({$inc: {stock: -count}}, (err, userStored) => {
                                })
                            }
                            return res.status(200).send(purchaseStored)
                        })
                    })
                })
        })
}

function getLastPurchases(req, res) {
    Purchase.find({})
        .sort({timestamp: -1})
        .limit(10)
        .exec(function (err, purchases) {
            if (err) return res.sendStatus(500);
            return res.status(200).send(purchases)
        })
}

function deletePurchase(req, res) {
    const purchaseId = req.params.id;
    if (!input.validId(purchaseId)) return res.sendStatus(400);

    Purchase.findOne({_id: purchaseId}, "+userId")
        .exec((err, purchase) => {
            if (err) return res.sendStatus(500);
            if (!purchase) return res.sendStatus(404);

            User.findOneAndUpdate({_id: purchase.userId}, {$inc: {balance: purchase.amount}})
                .exec((err, user) => {
                    if (err) return res.sendStatus(500);
                    purchase.remove();
                    return res.sendStatus(200)
                })
        })
}

module.exports = {
    getPurchase,
    getPurchaseList,
    getPurchaseListAll,
    getLastPurchases,
    savePurchase,
    deletePurchase
};
