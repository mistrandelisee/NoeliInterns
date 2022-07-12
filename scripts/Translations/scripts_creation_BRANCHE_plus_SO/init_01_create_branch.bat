set projectDir=C:\DEV\Total\DIAC\diac
set branchUS=DS-DIAC-4571
set branchOrigin=dev_RUN

rem INIT BRANCH
cd %projectDir%
git checkout %branchOrigin%
git pull origin %branchOrigin%
git checkout -b %branchUS%
git add .

pause