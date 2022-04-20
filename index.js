#!/usr/bin/env node

const program = require('commander');
const lrupdate = require('./commands/lrupdate');
const clearcache = require('./commands/clearcache');
const backup = require('./commands/dxpbackup/backup');
program
    .command('update')
    .alias('u')
    .description('Update liferay 7.4 bundle by moving the required modules and files from the old bundle to the new bundle.') // command description
    .option('-s, --old [value]', 'Liferay 7.4 old bundle')
    .option('-s, --new [value]', 'Liferay 7.4 new bundle')
    // function to execute when command is uses
    .action(function (update, args) {
        lrupdate.start(update.old,update.new);
    });
program
    .command('clear-cache')
    .alias('c')
    .description('Update liferay 7.4 bundle by moving the required modules and files from the old bundle to the new bundle.') // command description
    .option('-s, --bundle [value]', 'Liferay 7.4 old bundle')
    // function to execute when command is uses
    .action(function (clear, args) {
        clearcache.clear(clear.bundle);
    });

program
    .command('backup')
    .alias('b')
    .description('Backup liferay 7.4 bundle by dumping the db into sql dump files, fixing the database tables names, and backing up the document library folder, this will allow you to easily migrate dxp to dxpc.') // command description
    .option('-s, --bundle [value]', 'Liferay 7.4 old bundle')
    // function to execute when command is uses
    .action(function (clear, args) {
        backup.start(clear.bundle);
    });
// allow commander to parse `process.argv`
program.parse(process.argv);