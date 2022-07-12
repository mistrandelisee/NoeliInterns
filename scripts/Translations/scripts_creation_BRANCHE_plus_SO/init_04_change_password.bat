set projectDir=C:\DEV\Total\DIAC\diac
set scriptPath=C:\DEV\Total\DIAC\env\changePassword.apex

rem EXECUTE ANONYMOUS CODE TO CHANGE USER PASSWORD
cd %projectDir%
sfdx force:apex:execute -f %scriptPath%

pause