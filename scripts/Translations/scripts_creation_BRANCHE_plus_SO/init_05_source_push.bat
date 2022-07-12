set projectDir=C:\DEV\Total\DIAC\diac

rem Push source to scratch org
cd %projectDir%

sfdx force:source:push -f

pause

