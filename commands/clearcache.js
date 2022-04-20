const fs = require('fs-extra');
const path = require('path');

var clc = require('cli-color');
var error = clc.red.bold;
var warn = clc.yellow;
var notice = clc.blue.bold;
const log = console.log;

var directory = '/Users/mahmoudtayem/Documents/Liferay/Bundles/testing/from';
var tomcat_folder = '';

function deleteOSGIstate() {
	log(notice(`deleting [LiferayHome]/osgi/state folder`));
	fs.pathExists(`${directory}/osgi/state`, (err, exists) => {
		if (exists) {
			fs.remove(`${directory}/osgi/state`, (err) => {
				if (err)
					log(error(`error while delete [LiferayHome]/osgi/state]!`));
				else log(notice(`[LiferayHome]/osgi/state] has been deleted!`));
			});
		}
	});
}

function emptyFolder(folder) {
	log(notice(`clearing folder [LiferayHome]/${folder}`));
	fs.pathExists(`${directory}/${folder}`, (err, exists) => {
		if (exists) {
			fs.readdir(`${directory}/${folder}`, (err, files) => {
				if (err)
					log(error(`error while clearing [LiferayHome]/${folder}!`));
				for (const file of files) {
					fs.remove(`${directory}/${folder}/${file}`, (err) => {
						if (err)
							log(
								error(
									`error while clearing [LiferayHome]/${folder}!`
								)
							);
					});
				}
			});
		}
	});
}
async function findTomcatFolder() {
	return new Promise(function (resolve, reject) {
		fs.readdir(`${directory}`, (err, files) => {
			if (err) log(error(`error while finding tomcat folder`));
			for (const file of files) {
				if (file.startsWith('tomcat')) {
					tomcat_folder = file;
					resolve(tomcat_folder);
					break;
				}
			}
		});
	});
}
async function clear(bundle) {
	directory = bundle;
	await findTomcatFolder();
	deleteOSGIstate();
	emptyFolder('work');
	emptyFolder(`/${tomcat_folder}/temp`.toString());
	emptyFolder(`/${tomcat_folder}/work`.toString());
}
module.exports = {
	clear
};
