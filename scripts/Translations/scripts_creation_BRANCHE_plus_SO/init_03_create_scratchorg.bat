set projectDir=C:\DEV\Total\DIAC\diac
set orgAlias=DS-SPRINT76-RUN

rem INIT SCRATCH ORG
cd %projectDir%
sfdx force:org:create -s -f config/default-scratch-def.json -d25 -a %orgAlias%

pause