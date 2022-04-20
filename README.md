# liferay-commands

## Liferay Update Bundle 7.4 U(x) to 7.4 U(x+1)
### Liferay-cmd update --old [liferay bundle home] --new [liferay bundle home]
Update liferay 7.4 bundle by moving the required modules and files from the old bundle to the new bundle.

## Liferay Clear Cache Data
### liferay-cmd clear-cache --bundle [liferay bundle home]
Update liferay 7.4 bundle by moving the required modules and files from the old bundle to the new bundle.

## Liferay Backup
### liferay-cmd backup --bundle [liferay bundle home]
Backup liferay 7.4 bundle by dumping the db into sql dump files, fixing the database tables names, and backing up the document library folder, this will allow you to easily migrate DXP to DXPC.
#### Expected Output Files
- Data Base SQL Dump File "DB AS IS"
- Data Base SQL Dump File "Fixed DB"
- Document Library Compressed File "*.gtz"
- Data Base Compressed Dump File "*.gz"
