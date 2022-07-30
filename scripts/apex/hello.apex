// Use .apex files to store anonymous Apex.
// You can execute anonymous Apex in VS Code by selecting the
//     apex text and running the command:
//     SFDX: Execute Anonymous Apex with Currently Selected Text
// You can also execute the entire file by running the command:
//     SFDX: Execute Anonymous Apex with Editor Contents

string tempvar = 'Enter_your_name_here';
System.debug('Hello World!');
System.debug('My name is ' + tempvar);


List<Contact> contacts = new List<Contact>();
RH_User_Query userQry = RH_User_Query.getInstance();
for (User u : userQry.getOtherUsers()) {
    if (String.isNotBlank(u.RH_ContactId__c)) {
        contacts.add(new  Contact(Id=u.RH_ContactId__c,RH_User__c=u.Id));
    }
}
Database.SaveResult[] srList = Database.update(contacts, false);

Database.DeleteResult srList = Database.delete([select id from contact where recordTypeId != null and RH_User__c= null], false);

delete [select id from RH_Invoice__c ];
delete [select id from TimeSheet ];
delete [select id from Account WHERE recordTypeId=:RH_Constans.RH_CLIENT_ACCOUNT_RT ];


for( integer i = 0; i < 250; i++ ){
    insert new Account(name='Account'+i);
}

System.debug([SELECT id,name,createdDate FROM account order by createdDate desc limit 5]);

List<RH_Invoice_Item__c> items = new List<RH_Invoice_Item__c>();
for (RH_Invoice_Item__c item : [SELECT id FROM RH_Invoice_Item__c WHERE RH_description_fields__c= null]) {
    item.RH_description_fields__c='RH_ProjectId__c';
    items.add(item);
}
update items;