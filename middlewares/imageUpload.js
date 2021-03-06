'use strict';

const multer = require('multer');
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
    if (magic === MAGIC_NUMBERS.png) {
        ext = '.png';
    } else if (magic === MAGIC_NUMBERS.jpg1 || magic === MAGIC_NUMBERS.jpg2 || magic === MAGIC_NUMBERS.jpg3) {
        ext = '.jpg';
    } else if (ext === '.gif' && magic === MAGIC_NUMBERS.gif) {
        ext = '.gif';
    } else return false;
    return ext;
}

async function saveToDisk(file, imagePath, folderPath, next) {
    if(!next) next = () => {};
    imagePath = path.join('./public', imagePath);
    await checkIfExistsPath(`./public${folderPath}`);
    fs.writeFile(imagePath, file.buffer, 'binary', next);
}

function checkIfExistsPath(url) {
    return new Promise((resolve) => {
        if (!fs.existsSync(url)) {
            fs.mkdirSync(url);
        }

        resolve();
    });
}

function convertToValidName(imageName) {
    let newName = imageName;
    const specialChars = "!@#$^&%*()+=-[]\/{}|:<>?,.;\\";
    for (let i = 0; i < specialChars.length; i++) {
        newName = newName.replace(new RegExp("\\" + specialChars[i], 'gi'), '');
    }
    newName = newName.toLowerCase();
    newName = newName.replace(/ /g, "_");
    newName = newName.replace(/á/gi, "a");
    newName = newName.replace(/é/gi, "e");
    newName = newName.replace(/í/gi, "i");
    newName = newName.replace(/ó/gi, "o");
    newName = newName.replace(/ú/gi, "u");
    newName = newName.replace(/ñ/gi, "n");
    return newName;
}

module.exports = {
    userImage: multer({storage: storage}),
    productImage: multer({storage: storage}),
    offerImage: multer({storage: storage}),
    saveToDisk: saveToDisk,
    obtainExt: imageFormat,
    convertToValidName: convertToValidName
};