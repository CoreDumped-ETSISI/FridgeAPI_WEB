'use strict';

const multer  = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');

let storage = multer.memoryStorage();

const MAGIC_NUMBERS = {
    jpg1: 'ffd8ffdb',
    jpg2: 'ffd8ffe0',
    jpg3: 'ffd8ffe1',
    png: '89504e47',
    gif: '47494638'
};

function imageFormat(file) {
    if (!file || !file.buffer) return false;
    if (file.buffer.length > config.MAX_MB_IMAGE_SIZE * 1024 * 1024) return false;
    let ext = '';
    const magic = file.buffer.toString('hex', 0, 4);
    if(magic === MAGIC_NUMBERS.png){
        ext = '.png';
    } else if(magic === MAGIC_NUMBERS.jpg1 || magic === MAGIC_NUMBERS.jpg2 || magic === MAGIC_NUMBERS.jpg3){
        ext = '.jpg';
    } else if(ext === '.gif' && magic === MAGIC_NUMBERS.gif){
        ext = '.gif';
    } else return false;
    return ext;
}

function saveToDisk(file, imagePath, next) {
    imagePath = path.join('./public', imagePath);
    fs.writeFile(imagePath, file.buffer, 'binary', next);
}

function convertToValidName(imageName){
    let newName = imageName;
    newName.replace(' ','_');
    newName.replace('ñ','n');
    newName.replace('á','a');
    newName.replace('é','e');
    newName.replace('í','i');
    newName.replace('ó','o');
    newName.replace('ú','u');
    return encodeURIComponent(newName);
}

module.exports = {
    userImage: multer({ storage: storage }),
    productImage: multer({ storage: storage }),
    saveToDisk: saveToDisk,
    obtainExt: imageFormat,
    convertToValidName: convertToValidName
};