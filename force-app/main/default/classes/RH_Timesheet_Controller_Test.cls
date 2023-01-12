@istest
public with sharing class RH_Timesheet_Controller_Test {
 
    @TestSetup
    static void makeData(){

        contact ctc = new contact(lastname='abak', email='abak@mail.test',RH_Role__c='CEO');

        insert ctc;

        RH_WorkGroup__c Platsum = new RH_WorkGroup__c(Name = 'Platsum',RH_Team_Leader__c=ctc.Id,RH_Status__c='Draft');

        insert Platsum;

        ctc.RH_WorkGroup__c = Platsum.Id;

        update ctc;

        String PROFILENAME = 'Custom Identity User';
        
        //Id currentUserProfileId = UserInfo.getProfileId();
        
        Profile pf = [Select Name,Id From Profile Where Name = :PROFILENAME];
        
        contact ct = new contact(LastName='contactTest', email ='contact@mail.test', RH_WorkGroup__c=Platsum.Id);

        insert ct;

        list<user> usrList = new list<user>();

        for(integer i=1;i<=2;i++){
            if(math.mod(i,2) == 0){
                usrList.add(
                    new user(Username='user'+i+'@acme.org',RH_ContactId__c=ctc.Id, LastName='Lastname'+i, Alias='alias ', Email='user'+i+'@mail.org', TimeZoneSidKey='Pacific/Apia',LocaleSidKey='eu_ES',EmailEncodingKey='UTF-8', Profile = pf, ProfileId=pf.Id ,LanguageLocaleKey='en_US')
                );
            }else {
                usrList.add(
                    new user(Username='user'+i+'@acme.org',RH_ContactId__c=ct.Id, LastName='Lastname'+i, Alias='alias ', Email='user'+i+'@mail.org', TimeZoneSidKey='Pacific/Apia',LocaleSidKey='eu_ES',EmailEncodingKey='UTF-8', Profile = pf, ProfileId=pf.Id ,LanguageLocaleKey='en_US')
                );
            }
            
        }

        insert usrList;
        
    }

    @istest
    static void timesheetCreationTest(){
        
        user us = [SELECT Id,Username,RH_ContactId__c FROM User WHERE Username = 'user1@acme.org'];
        
        system.runAs(us){
            
            RH_Timesheet_Controller.sheetWrapper sheetObj = new RH_Timesheet_Controller.sheetWrapper();

            sheetObj.Id = null;
            sheetObj.startDate = Date.today();
            sheetObj.endDate = Date.today().addDays(2);

            Map<string,Object> mapTimesheets = RH_Timesheet_Controller.timesheetCreation(JSON.serialize(sheetObj));

            system.assertEquals(true, mapTimesheets.get('Ok'));

        }
        
    }

    @istest
    static void timesheetCreationTestFail(){

        Map<string,Object> mapTimesheets = RH_Timesheet_Controller.timesheetCreation(JSON.serialize('sheetObj'));

        system.assertEquals(true, mapTimesheets.get('error'));

    }

    @istest
    static void InitFilterTest(){

        Map<string, Object> filterMap = RH_Timesheet_Controller.InitFilter();

        system.assertEquals(true, filterMap.get('Ok'));

    }

    @istest
    static void timeSheetEntryCreationTest(){

        user us = [SELECT Id,Username,RH_ContactId__c FROM User WHERE Username = 'user1@acme.org'];

        ServiceResource srR = new ServiceResource(RH_External_ID__c=us.Id,Name='baba',RelatedRecordId=us.Id);

        insert srR;

        account acc = new account(Name='buildingTest');
        
        insert acc;

        Timesheet tmsht = new Timesheet(startDate=Date.today(),endDate=Date.today().addDays(2),ServiceResourceId=srR.Id);

        insert tmsht;

        // TimeSheetEntry myTimeSheetEntry = new TimeSheetEntry(TimeSheetId=tmsht.Id,startTime=Datetime.now(),endTime=Datetime.now());

        // insert myTimeSheetEntry;

        Project__c pjct = new Project__c(Name='Project_Test',Description__c='Test description',RH_Account_ID__c=acc.Id,Start_Date__c=Date.today(),Status__c='Active');

        insert pjct;

        RH_Timesheet_Controller.entryWrapper entryObject = new RH_Timesheet_Controller.entryWrapper();

        entryObject.Description = 'serberg';
        entryObject.Id = null;
        entryObject.TimeSheetId = tmsht.Id;
        entryObject.Subject =  'subject';
        entryObject.ProjectId = pjct.Id;
        entryObject.StartTime = Datetime.now();
        entryObject.EndTime = Datetime.now();

        Map<string, object> timesheetMap = RH_Timesheet_Controller.timeSheetEntryCreation(JSON.serialize(entryObject)); 

        system.assertEquals(true, timesheetMap.get('Ok'));

    }

    @istest
    static void timeSheetEntryCreationTestFail(){

        RH_Timesheet_Controller.entryWrapper entryObject = new RH_Timesheet_Controller.entryWrapper();

        entryObject.Description = 'serberg';
        entryObject.Id = null;
        entryObject.TimeSheetId = null;
        entryObject.Subject =  'subject';
        entryObject.ProjectId = 'null';
        entryObject.StartTime = Datetime.now();
        entryObject.EndTime = Datetime.now();

        Map<string, object> timesheetMap = RH_Timesheet_Controller.timeSheetEntryCreation(JSON.serialize(entryObject)); 

        system.assertEquals(true, timesheetMap.get('error'));
    }

    @istest
    static void getTimesheetsTest(){

        contact ct = [SELECT Id,LastName,RH_User__c FROM contact WHERE LastName ='contactTest'];

        user us = [SELECT Id,Username,RH_ContactId__c FROM User WHERE Username = 'user1@acme.org'];

        ct.RH_User__c = us.Id;

        update ct;

        us.RH_ContactId__c = ct.Id;

        update us;

        ServiceResource srR = new ServiceResource(RH_External_ID__c=us.Id,Name='baba',RelatedRecordId=us.Id);

        insert srR;
        
        Timesheet tmsht = new Timesheet(startDate=Date.today(),endDate=Date.today().addDays(2),ServiceResourceId=srR.Id);

        insert tmsht;

        system.runAs(us){

            RH_Timesheet_Controller.TimesheetFilterWrapper Tfw = new RH_Timesheet_Controller.TimesheetFilterWrapper();

        
            Tfw.status = 'draft';
            Tfw.startDate = Date.today();
            Tfw.endDate = Date.today().addDays(1);
            Tfw.isActive = true;
            Tfw.orderBy = null;
            Tfw.orderOn = 'desc';

            Map<string, object> timesheetMap = RH_Timesheet_Controller.getTimeSheets(JSON.serialize(Tfw),us.Id);

            system.assertEquals(true,timesheetMap.get('Ok'));
        }
        
    }

    @istest
    static void getTimesheetsTestFail(){
        
        Map<string, object> timesheetMap = RH_Timesheet_Controller.getTimeSheets('JSON.serialize(Tfw)','us.Id');

        system.assertEquals(true,timesheetMap.get('error'));

    }

    @istest
    static void gettimesheetTest(){

        user us = [SELECT Id,Username,RH_ContactId__c FROM User WHERE Username = 'user1@acme.org'];

        ServiceResource srR = new ServiceResource(RH_External_ID__c=us.Id,Name='baba',RelatedRecordId=us.Id);

        insert srR;
        
        Timesheet tmsht = new Timesheet(startDate=Date.today(),endDate=Date.today().addDays(2),ServiceResourceId=srR.Id);

        insert tmsht;

        

        Map<string, object> timesheetMap = RH_Timesheet_Controller.getTimeSheet(tmsht.Id);

        system.assertEquals(true,timesheetMap.get('Ok'));

    }

    @istest
    static void getTimeSheetTestFail(){

        Map<string, object> timesheetMap = RH_Timesheet_Controller.getTimeSheet('tmsht.Id');

        system.assertEquals(true,timesheetMap.get('error'));

    }

    @istest
    static void approvalTimesheetTest(){

        // contact ctc = new contact(lastname='gael', email='gael@mail.test',RH_Role__c='CEO');

        // insert ctc;
        
        user us = [SELECT Id,Username,RH_ContactId__c FROM User WHERE Username = 'user1@acme.org'];

        // us.RH_ContactId__c = ctc.Id;

        // update us;

        ServiceResource srR = new ServiceResource(RH_External_ID__c=us.Id,Name='baba',RelatedRecordId=us.Id);

        insert srR;

        
        Timesheet tmsht = new Timesheet(startDate=Date.today(),endDate=Date.today().addDays(2),ServiceResourceId=srR.Id);

        insert tmsht;

        // TimeSheetEntry myTimeSheetEntry = new TimeSheetEntry(TimeSheetId=tmsht.Id,startTime=Datetime.now(),endTime=Datetime.now());

        // insert myTimeSheetEntry;

        system.runAs(us){

            Map<string, object> approvalMap = RH_Timesheet_Controller.approvalTimesheet(JSON.serialize(tmsht));

            system.assertEquals(true,approvalMap.get('Ok'));

        }
        

    }

    @istest
    static void approvalTimesheetTestFail(){

        Map<string, object> approvalMap = RH_Timesheet_Controller.approvalTimesheet(JSON.serialize('ALU154frsq5000Q'));

        system.assertEquals(true,approvalMap.get('error'));

    }

    @istest
    static void deleteTimesheetTest(){
        user us = [SELECT Id,Username,RH_ContactId__c FROM User WHERE Username = 'user1@acme.org'];

        ServiceResource srR = new ServiceResource(RH_External_ID__c=us.Id,Name='baba',RelatedRecordId=us.Id);

        insert srR;

        Timesheet tmsht = new Timesheet(startDate=Date.today(),endDate=Date.today().addDays(2),ServiceResourceId=srR.Id);

        insert tmsht;

        Map<string, object> deleteMap = RH_Timesheet_Controller.deleteTimesheet(tmsht.Id);

        system.assertEquals(true,deleteMap.get('Ok'));
    }

    @istest
    static void deleteTimesheetTestFail(){
       

        Map<string, object> deleteMap = RH_Timesheet_Controller.deleteTimesheet('AF145M4LAMGR1234Q');

        system.assertEquals(true,deleteMap.get('error'));

    }

    @istest
    static void deleteTimesheetEntryTest(){

        user us = [SELECT Id,Username,RH_ContactId__c FROM User WHERE Username = 'user1@acme.org'];

        ServiceResource srR = new ServiceResource(RH_External_ID__c=us.Id,Name='baba',RelatedRecordId=us.Id);

        insert srR;

        account acc = new account(Name='buildingTest');
        
        insert acc;

        Timesheet tmsht = new Timesheet(startDate=Date.today(),endDate=Date.today().addDays(2),ServiceResourceId=srR.Id);

        insert tmsht;

        TimeSheetEntry myTimeSheetEntry = new TimeSheetEntry(TimeSheetId=tmsht.Id,startTime=Datetime.now(),endTime=Datetime.now());

        insert myTimeSheetEntry;

        Map<string, object> deleteMap = RH_Timesheet_Controller.deleteTimeSheetEntry(myTimeSheetEntry.Id);

        system.assertEquals(true,deleteMap.get('Ok'));

    }

    @istest
    static void deleteTimesheetEntryTestFail(){

        Map<string, object> deleteMap = RH_Timesheet_Controller.deleteTimeSheetEntry('AF145M4LAMGR1234Q');

        system.assertEquals(true,deleteMap.get('error'));

    }

    @istest
    static void submitTimeSheetTest(){

        contact ctc = [SELECT Id,LastName,RH_User__c FROM contact WHERE LastName ='abak'];

        contact ct = [SELECT Id,LastName,RH_User__c FROM contact WHERE LastName ='contactTest'];

        user us = [SELECT Id,Username,RH_ContactId__c FROM User WHERE Username = 'user1@acme.org'];

        user us2 = [SELECT Id,Username,RH_ContactId__c FROM User WHERE Username = 'user2@acme.org'];

        ctc.RH_User__c = us2.Id;
        
        update ctc;

        ct.RH_User__c = us.Id;

        update ct;

        us.RH_ContactId__c = ct.Id;

        update us;

        ServiceResource srR = new ServiceResource(RH_External_ID__c=us.Id,Name='baba',RelatedRecordId=us.Id);

        insert srR;

        Timesheet tmsht = new Timesheet(startDate=Date.today(),endDate=Date.today().addDays(2),ServiceResourceId=srR.Id);

        insert tmsht;

        system.runAs(us){

            Map<string, object> submitMap = RH_Timesheet_Controller.submitTimeSheet(tmsht.Id);
            
            system.assertEquals(true,submitMap.get('Ok'));

        }

    }

    @istest 
    static void submitTimeSheetTestFail(){
       
        Map<string, object> submitMap = RH_Timesheet_Controller.submitTimeSheet('tmsht.Id');
            
        system.assertEquals(true,submitMap.get('error'));

    }

    @istest
    static void generatePDFTest(){

        user us = [SELECT Id,Username,RH_ContactId__c FROM User WHERE Username = 'user1@acme.org'];

        ServiceResource srR = new ServiceResource(RH_External_ID__c=us.Id,Name='baba',RelatedRecordId=us.Id);

        insert srR;

        Timesheet tmsht = new Timesheet(startDate=Date.today(),endDate=Date.today().addDays(2),ServiceResourceId=srR.Id);

        insert tmsht;

        // list<Id> sheetIdList = new list<Id>();

        // sheetIdList.add(tmsht.Id);

        String PDFsheet = RH_Timesheet_Controller.generatedPDF(tmsht.Id);
    }

    @istest
    static void InitEntryCreationTest(){

        user us = [SELECT Id,Username,RH_ContactId__c FROM User WHERE Username = 'user1@acme.org'];

        system.runAS(us){
            Map<string, object> InitMap = RH_Timesheet_Controller.InitEntryCreation();
            system.assertEquals(true,InitMap.get('Ok'));
        }

    }

    @istest
    static void InitEntryCreationTestFail(){

        Map<string, object> InitMap = RH_Timesheet_Controller.InitEntryCreation();
        system.assertEquals(true,InitMap.get('error'));

    }
}