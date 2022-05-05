var mysql = require('mysql');
const nReadlines = require('n-readlines');
const {createGzip} = require("zlib");
const {createReadStream, createWriteStream} = require("fs");
var mysqldump = require('mysqldump');
const mysqlBackup = require('mysql-backup');
const {tar} = require('zip-a-folder');
var liferayHome = "/Users/mahmoudtayem/Documents/Liferay/Bundles/testing/from";
var timeStamp = "";
var exportFolder = "";
var dbConnectionConfig = {
    host: "localhost",
    port: "3306",
    user: "mahmoud",
    password: "SQLAdmin",
    database: "lportal"
}

function getDate() {
    var date_ob = new Date();
    var day = ("0" + date_ob.getDate()).slice(-2);
    var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    var year = date_ob.getFullYear();

    var date = year + "-" + month + "-" + day;

    var hours = date_ob.getHours();
    var minutes = date_ob.getMinutes();
    var seconds = date_ob.getSeconds();

    return `${year}-${month}-${day}__${hours}-${minutes}-${seconds}`;

}

const fs = require('fs-extra');
const {pathExistsSync} = require("fs-extra");
var con = mysql.createConnection({
    host: dbConnectionConfig.host,
    user: dbConnectionConfig.user,
    password: dbConnectionConfig.password,
    database: dbConnectionConfig.database,
    port: dbConnectionConfig.port
});

async function compressFile(filePath) {
    var prom = new Promise(function (resolve, reject) {
        console.log("Compressing mysql dump file...");
        const stream = createReadStream(`${exportFolder}/${filePath}`);
        stream
            .pipe(createGzip())
            .pipe(createWriteStream(`${exportFolder}/${filePath}.gz`))
            .on("finish", () => {
                console.log("mysql dump file has been compressed!");
                resolve(true);
            });
    });
    return prom;

}

function capitalize(s) {
    return s && s[0].toUpperCase() + s.slice(1);
}

async function mysqlDumpToFile(dumpFile, compress) {
    console.log(`Dumping ${dumpFile} data! into ${dumpFile}.sql started...`);
    var prom = new Promise((resolve, reject) => {
        var data = mysqldump({
            connection: {
                host: dbConnectionConfig.host,
                user: dbConnectionConfig.user,
                password: dbConnectionConfig.password,
                database: dbConnectionConfig.database,
                port: dbConnectionConfig.port
            },
            dump: {
                schema: {
                    table: {
                        dropIfExist: true
                    },
                    schema: true
                }
            }
        }).then(async result => {
            saveFile(`${exportFolder}/${dumpFile}.sql`, `${result.dump.schema}\n${result.dump.data}\n${result.dump.trigger}`).then(async result => {
                console.log(`Dumping ${dumpFile} data! into ${dumpFile}.sql completed!`);
                if (compress)
                    await compressFile(`${dumpFile}.sql`.toString());
                resolve(true);
            });
        });
    });
    return prom;
}

async function saveFile(filePath, fileData) {
    var prom = new Promise((resolve, reject) => {
        fs.writeFile(`${filePath}`, fileData, function (err) {
            if (err)
                reject(false);
            resolve(true);
        });
    });
    return prom;
}

async function sqlCommand(con, command) {
    return new Promise((resolve, reject) => {
        con.query(`${command}`, function (error, result, fields) {
            if (error) {
                console.log(`error while executing command: ${command}`);
                reject(error);
            }
            resolve(result);
        });
    });
}

function processBackup() {
    prom = new Promise(async function (resolve, reject) {
        console.log("Finding DB Configurations");
        await getLiferayConfigurationData(liferayHome);
        console.log("Starting DB Job...");
        var db_filename = `${timeStamp}__DB`;
        console.log("DB Job Started...");
        mysqlDumpToFile(db_filename, false).then(async res => {
            await documentLibraryJob();
            await OSGIModulesJob();
            await WARModules();
            await PropertiesJob();
            resolve(true);
            console.log("DB Job Completed!");
        });
    });
    return prom;
}

async function start(liferayBundleHome) {
    liferayHome = liferayBundleHome;
    timeStamp = getDate();
    exportFolder = `Export-${timeStamp}`;
    fs.ensureDir(`${exportFolder}`).then(async () => {
        console.log(`Export folder "${exportFolder}" has been created!`);
        await processBackup();
        console.log(`Exporting bundle to folder "${exportFolder}" completed!`);
        process.exit(1);
    })

}

async function getLiferayConfigurationData(home) {
    var prom = new Promise(async function (resolve, reject) {
        if (await fs.pathExists(`${home}/portal-setup-wizard.properties`)) {
            var broadbandLines = new nReadlines(`${home}/portal-setup-wizard.properties`);
            let line;
            while (line = broadbandLines.next()) {
                line = line.toString('ascii');
                if (line.indexOf("jdbc.default.url") > -1) {
                    var rawConfig = line.replace("jdbc.default.url", "").replace("//", "|").replace("/", "|").replace("?", "|");
                    var configurationParts = rawConfig.split("|");
                    dbConnectionConfig.database = configurationParts[2];
                    if (configurationParts[1].indexOf(":") > -1) {
                        dbConnectionConfig.host = configurationParts[1].split(":")[0];
                        dbConnectionConfig.port = configurationParts[1].split(":")[1];
                    } else {
                        dbConnectionConfig.host = configurationParts[1];
                        dbConnectionConfig.port = "3306";
                    }
                }
                if (line.indexOf("jdbc.default.username") > -1) {

                    var dbUserName = line.replace("jdbc.default.username=", "");
                    dbConnectionConfig.user = dbUserName;

                }
                if (line.indexOf("jdbc.default.password") > -1) {
                    var dbPassword = line.replace("jdbc.default.password=", "");
                    dbConnectionConfig.password = dbPassword;
                }
            }
        }
        if (await fs.pathExists(`${home}/portal-ext.properties`)) {
            var broadbandLines = new nReadlines(`${home}/portal-ext.properties`);
            let line;
            while (line = broadbandLines.next()) {
                line = line.toString('ascii');
                if (line.indexOf("jdbc.default.url") > -1) {
                    var rawConfig = line.replace("jdbc.default.url", "").replace("//", "|").replace("/", "|").replace("?", "|");
                    var configurationParts = rawConfig.split("|");
                    dbConnectionConfig.database = configurationParts[2];
                    if (configurationParts[1].indexOf(":") > -1) {
                        dbConnectionConfig.host = configurationParts[1].split(":")[0];
                        dbConnectionConfig.port = configurationParts[1].split(":")[1];
                    } else {
                        dbConnectionConfig.host = configurationParts[1];
                        dbConnectionConfig.port = "3306";
                    }
                }
                if (line.indexOf("jdbc.default.username") > -1) {

                    var dbUserName = line.replace("jdbc.default.username=", "");
                    dbConnectionConfig.user = dbUserName;
                }
                if (line.indexOf("jdbc.default.password") > -1) {
                    var dbPassword = line.replace("jdbc.default.password=", "");
                    dbConnectionConfig.password = dbPassword;
                }
            }
        }
        resolve(true);
    });
    return prom;
}

async function documentLibraryJob() {
    var prom = new Promise((resolve, reject) => {
        fs.copy(`${liferayHome}/data/document_library`, `${exportFolder}/document_library`)
            .then(() => {
                resolve(true);
            })
            .catch(err => {
                reject(false);
            })
    });
    return prom;
}

async function OSGIModulesJob() {
    console.log(`Exporting OSGI Modules`);
    var prom = new Promise((resolve, reject) => {
        fs.copy(`${liferayHome}/osgi/modules`, `${exportFolder}/OSGIModules`)
            .then(() => {
                console.log(`Exporting OSGI modules completed!`);
                resolve(true);
            })
            .catch(err => {
                reject(false);
            })
    });
    return prom;
}

async function WARModules() {
    console.log(`Exporting OSGI WAR Modules`);
    var prom = new Promise((resolve, reject) => {
        fs.copy(`${liferayHome}/osgi/war`, `${exportFolder}/WARModules`)
            .then(() => {
                console.log(`Exporting OSGI War modules completed!`);
                resolve(true);
            })
            .catch(err => {
                reject(false);
            })
    });
    return prom;
}

async function PropertiesJob() {
    console.log(`Exporting Properties`);
    if(await fs.pathExists(`${liferayHome}/portal-setup-wizard.properties`))
    {
        await fs.copySync(`${liferayHome}/portal-setup-wizard.properties`, `${exportFolder}/properties/portal-setup-wizard.properties`);
    }
    if(await fs.pathExists(`${liferayHome}/portal-ext.properties`))
    {
        await fs.copySync(`${liferayHome}/portal-ext.properties`, `${exportFolder}/properties/portal-ext.properties`);
    }
    console.log(`Exporting Properties completed!`);
}

module.exports = {
    start
}

