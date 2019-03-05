"use strict";

const services = require("../services");
const input = require("../services/inputValidators");
const Purchase = require("../models/purchase");
const Product = require("../models/product");
const Offer = require("../models/offer");
const User = require("../models/user");

const rtn = require("../middlewares/apiResults");

function getPurchase(req, res) {
  let purchaseId = req.params.id;
  if (!input.validId(purchaseId)) return rtn.status(res, 400);

  Purchase.findOne({ _id: purchaseId, userId: req.user })
    .select("-userId") //TODO: Overwrite function toJSON to avoid this
    .exec((err, purchase) => {
      if (err) return rtn.intrServErr(res);
      if (!purchase) return rtn.notFound(res, dict.objs.purchase);
      return rtn.obj(res, 200, purchase);
    });
}

function getPurchaseList(req, res) {
  Purchase.find({ userId: req.user })
    .select("-userId")
    .sort({ timestamp: -1 })
    .exec((err, purchases) => {
      if (err) return rtn.intrServErr(res);
      if (!purchases || purchases.length === 0) return rtn.notFound(res, dict.objs.purchase);
      return rtn.obj(res, 200, purchases);
    });
}

function getPurchaseListAll(req, res) {
  Purchase.find({}, (err, purchases) => {
    if (err) return rtn.intrServErr(res);
    if (!purchases || purchases.length === 0) return rtn.notFound(res, dict.objs.purchase);
    return rtn.obj(res, 200, purchases);
  });
}

function savePurchase(req, res) {
  if (!req.body.productList && !req.body.offerList) return rtn.status(res, 400);
  let idList = req.body.productList.split(",");
  let offersList = req.body.offerList.split(",");

  Offer.find({ _id: { $in: offersList } })
  .populate({
    path: "products.product",
    populate: {
      path: "product",
      model: "Product"
    }
  }).exec(function(err, offers) {
    if (offersList.length < 1 && err) return rtn.intrServErr(res);

    productIdListGenerator(offers, offersList, req.body.productList).then(response => {
      let productIdList = response.split(",");

      Product.find({ _id: { $in: productIdList } }).exec(function(err, products) {
        if (productIdList.length < 1 && err) return rtn.intrServErr(res);
        if ( (!products || products.length === 0) && (!offers || offers.length === 0) )
          return rtn.notFound(res, dict.objs.productOrOffer);
        let amount = 0;
        let productList = [];
        let offerList = [];
        if(offers){
          for (let x = 0; x < offers.length; x++) {
            let count = services.countOccurrences(offers[x]._id, offersList);
            amount += offers[x].price * count; 
            offerList.push({ offer: offers[x], quantity: count });
          }
        }
        if(products){
          for (let x = 0; x < products.length; x++) {
            let count = services.countOccurrences(products[x]._id, idList);
            if(count > 0){
              if (count > products[x].stock) {
                return rtn.status(res, 400);
              }
              amount += products[x].price * count;
              productList.push({ product: products[x], quantity: count });
            }
          }
        }
        if (amount < 0.01) return rtn.status(res, 400);
        const purchase = new Purchase({
          userId: req.user,
          amount: amount,
          productList: productList,
          offerList: offerList
        });

        User.findOne({ _id: req.user }).exec((err, user) => {
          if (err) return rtn.intrServErr(res);
          if (!user) return rtn.notFound(res, dict.objs.user);
          if (user.balance - amount < -0.009) return rtn.status(res, 402);

          purchase.save((err, purchaseStored) => {
            if (err) return rtn.intrServErr(res);
            user.updateOne({ $inc: { balance: -amount } }, async (err, userStored) => {
              if (err) return rtn.intrServErr(res);

              for (let x = 0; x < products.length; x++) {
                await updateProdStock(products[x], productIdList);
              }

              return rtn.obj(res, 200, purchaseStored);
            });
          });
        });
      });
    })
  });
}

function updateProdStock(product, productIdList) {
  const count = services.countOccurrences(product._id, productIdList);
  product.updateOne(
    { $inc: { stock: -count } },
    (err, productStored) => {
      if (err) return rtn.intrServErr(res);
      if (!productStored) return rtn.notFound(res, dict.objs.product);
    }
  )
}

function productIdListGenerator(offers, offerList, productList){
  return new Promise((resolve, reject) => {
    if(offers && offers.length > 0){
      let list = productList;

      for (let i = 0; i < offers.length; i++){
        let count = services.countOccurrences(offers[i]._id, offerList);
        for (let j = 0; j < count; j++){
          for (let x = 0; x < offers[i].products.length; x++){
            for (let y = 0; y < offers[i].products[x].quantity; y++){
              if(list === ""){
                list = `${offers[i].products[x].product._id}`
              } else {
                list = `${list},${offers[i].products[x].product._id}`
              }
            }
          }
        }

        if(i === offers.length-1){
          resolve(list);
        }
      }
    } else {
      resolve(productList);
    }
  });
}

function getLastPurchases(req, res) {
  Purchase.find({})
    .sort({ timestamp: -1 })
    .limit(10)
    .populate("userId")
    .exec(function(err, purchases) {
      if (err) return rtn.intrServErr(res);
      let finalPurchases = purchases.map(purchase => {
        purchase.userId.email = undefined;
        purchase.userId.balance = undefined;
        purchase.userId.status = undefined;
        purchase.userId.signUpDate = undefined;
        return purchase;
      });
      return rtn.obj(res, 200, finalPurchases);
    });
}

function deletePurchase(req, res) {
  const purchaseId = req.params.id;
  if (!input.validId(purchaseId)) return rtn.status(res, 400);

  Purchase.findOne({ _id: purchaseId }, "+userId").exec((err, purchase) => {
    if (err) return rtn.intrServErr(res);
    if (!purchase) return rtn.notFound(res, dict.objs.purchase);

    User.findOneAndUpdate(
      { _id: purchase.userId },
      { $inc: { balance: purchase.amount } }
    ).exec((err, user) => {
      if (err) return rtn.intrServErr(res);
      purchase.remove();
      return rtn.status(res, 200);
    });
  });
}

module.exports = {
  getPurchase,
  getPurchaseList,
  getPurchaseListAll,
  getLastPurchases,
  savePurchase,
  deletePurchase
};
