// Use .apex files to store anonymous Apex.
// You can execute anonymous Apex in VS Code by selecting the
//     apex text and running the command:
//     SFDX: Execute Anonymous Apex with Currently Selected Text
// You can also execute the entire file by running the command:
//     SFDX: Execute Anonymous Apex with Editor Contents

/*string tempvar = 'Enter_your_name_here';
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
*/


string fieldsStr='Id,Name,Contact_Id__r.Name,Description__c, Start_Dates__c, End_Dates__c,Contact_Id__r.Account.Name';
string object_name='Event__c';

String query='SELECT '+fieldsStr+' FROM '+object_name+' LIMIT 1';//+' WHERE Id =\''+String.escapeSingleQuotes(recordId) +'\'';
Sobject record= Database.query(query);

Map<String,String> mapReturn_test = RH_telegramMessageConfigImpl.buildMapping(record, fieldsStr);

// getValue(sObject record, string field)
// RH_telegramMessageConfigImpl


// ''
String action= 'TG_EVENT_SUBMITTED';
String recordId= 'a087Q00000O58alQAB';
String chatId= '518673920';
RH_telegramMessageConfigImpl impl = new RH_telegramMessageConfigImpl(action,recordId);
impl.buildMessage(chatId, UserInfo.getUserId());
RH_Telegram_Utility.sendMessages(impl.messages);


for (Integer i = 0; i < 25; i++) {
    Messaging.SingleEmailMessage mail =  Messaging.renderStoredEmailTemplate('00X7Q000000uHUBUA2', UserInfo.getUserId(), null);
    if (i==0) {
        System.debug(mail.getHtmlBody()); 
    }
}


String action= 'TG_EVENT_SUBMITTED';
String recordId= 'a087Q00000O58alQAB';
List<String> uIds = new List<String>{
    '0057Q000003m1ycQAA',//Mako user Mistrano  base	
    '518673920'//RH Melissa	
    };
RH_telegramMessageConfigImpl.WHOIDKEY='Id';
RH_telegramMessageConfigImpl.notifyTelegram(action, recordId, uIds);


