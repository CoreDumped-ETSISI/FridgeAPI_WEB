'use strict';

const Cron = require('cron').CronJob;
const exec = require('child_process').exec;

function dateToYMD(date) {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d)
}

function createBK() {
    const date = new Date();
    let cmd;
    if (process.env.SO === 'LINUX')
        cmd = 'mongodump --db ' + process.env.DB_NAME + ' --out ' + process.env.BK_DIR + '/' + dateToYMD(date);
    else
        cmd = '"C:/Program Files/MongoDB/Server/3.4/bin/mongodump.exe" --host localhost --port 27017 --db ' + process.env.DB_NAME + ' --out ' + process.env.BK_DIR + '/' + dateToYMD(date);
    exec(cmd, function (error, stdout, stderr) {
        if (error) console.log(error);
        else console.log("---------------- Backup created ;) ----------------")
    });
}

new Cron('0 0 0 * * *', function () {
    createBK()
}, null, true, 'Europe/Madrid');
