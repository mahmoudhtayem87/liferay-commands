const fs = require('fs-extra');

var clc = require('cli-color');
var error = clc.red.bold;
var warn = clc.yellow;
var notice = clc.blue.bold;
const log = console.log;
var old_liferay_path;
var new_liferay_path;

function copyPortalExtProperties() {
	fs.pathExists(
		`${old_liferay_path}/portal-setup-wizard.properties`,
		(err, exists) => {
			if (exists) {
				fs.copy(
					`${old_liferay_path}/portal-setup-wizard.properties`,
					`${new_liferay_path}/portal-setup-wizard.properties`,
					function (err) {
						if (err) {
							log(
								error(
									`error while copying portal-setup-wizard.properties!`
								)
							);
							return;
						}
						log(
							notice(
								`portal-setup-wizard.properties file has been copied!`
							)
						);
					}
				);
			}
		}
	);
	fs.pathExists(
		`${old_liferay_path}/portal-ext.properties`,
		(err, exists) => {
			if (exists) {
				fs.copy(
					`${old_liferay_path}/portal-ext.properties`,
					`${new_liferay_path}/portal-ext.properties`,
					function (err) {
						if (err) {
							log(
								error(
									`error while copying portal-ext.properties!`
								)
							);
							return;
						}
						log(
							notice(
								`portal-ext.properties file has been copied!`
							)
						);
					}
				);
			}
		}
	);
}
function copyOSGIModules() {
	fs.copy(
		`${old_liferay_path}/osgi/modules`,
		`${new_liferay_path}/deploy`,
		{recursive: true},
		function (err) {
			if (err) {
				log(error(`error while copying OSGI Modules!`));
				return;
			}
			log(
				notice(
					`{Current Liferay Bundle}/osgi/modules/ files have been copied to {Updated Liferay Bundle}/deploy`
				)
			);
		}
	);
}
function copyOSGIConfig() {
	fs.copy(
		`${old_liferay_path}/osgi/configs`,
		`${new_liferay_path}/osgi/configs`,
		{recursive: true},
		function (err) {
			if (err) {
				log(error(`error while copying OSGI Configs!`));
				return;
			}
			log(
				notice(
					`{Current Liferay Bundle}/osgi/configs files have been copied to {Updated Liferay Bundle}/osgi/configs`
				)
			);
		}
	);
}
function copyDocumentLibrary() {
	fs.copy(
		`${old_liferay_path}/data/document_library`,
		`${new_liferay_path}/data/document_library`,
		{recursive: true},
		function (err) {
			if (err) {
				log(error(`error while copying Document Library!`));
				return;
			}
			log(
				notice(
					`{Current Liferay Bundle}/data/document_library files have been copied to {Updated Liferay Bundle}/data/document_library`
				)
			);
		}
	);
}
function start(from, to) {
	old_liferay_path = from;
	new_liferay_path = to;
	copyDocumentLibrary();
	copyOSGIModules();
	copyOSGIConfig();
	copyPortalExtProperties();
}
module.exports = {
	start
};
