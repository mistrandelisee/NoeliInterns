rem set UTF8
chcp 65001

set appDir=C:\APP\MIgration données\SFDX-Data-Move-Utility\
set userOrgOrigin=cyril.pengam@niji.fr.diac.devrun
set userOrgDestination=test-deakasfoxztj@example.com

rem IMPORT DATA FROM ORIGIN ORG to DESTINATION ORG
cd %appDir%

sfdx sfdmu:run --sourceusername %userOrgOrigin%  --targetusername %userOrgDestination%

pause

