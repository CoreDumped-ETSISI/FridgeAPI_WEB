'use strict';

const dict = require("./dictionary");

function returnObj(httpResponse, status, obj){
    //if(obj.message) console.log(`${status}: ${obj.message}`);
    return httpResponse.status(status).jsonp(obj);
}

function returnMessage(httpResponse, status, msg){
    return returnObj(httpResponse, status, { message: msg });
}

function sendStatus(res, status){
    return res.sendStatus(status);
}

function returnNotValidObj(httpResponse, status, objName){
    return returnMessage(httpResponse, status, _objNotValidStr(objName));
}

function status500(httpResponse) {
    return returnMessage(httpResponse, 500, dict.errMsgs.intServErr);
}

function status404(httpResponse, objName) {
    return returnMessage(httpResponse, 404, _objNotFoundStr(objName));
}

function status400(httpResponse, msg) {
    return returnMessage(httpResponse, 400, msg);
}

function status200(httpResponse, msg) {
    return returnMessage(httpResponse, 200, msg);
}

// INTERNAL FUNCTIONS
function _capitalize(str) {
    return str.toLowerCase().replace(/^\w/, c => c.toUpperCase());
}

function _objNotFoundStr(str){
    return `${_capitalize(str)} ${dict.errMsgs.notFound}`;
}

function _objNotValidStr(str){
    return `${_capitalize(str)} ${dict.errMsgs.notValid}`;
}

module.exports = {
    message: returnMessage,
    obj: returnObj,
    intrServErr: status500,
    notFound: status404,
    msgBadReq: status400,
    success: status200,
    msgNotValid: returnNotValidObj,
    status: sendStatus,
};