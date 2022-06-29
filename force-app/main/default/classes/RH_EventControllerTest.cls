@isTest
public with sharing class RH_EventControllerTest {
    private static RH_Event_Query eventQuery = RH_Event_Query.getInstance();
    
    @testSetup
    static void setup() {
        Contact con = new Contact(LastName='Ndon',FirstName='Will');
        insert con;
        String PROFILENAME = 'Custom Identity User';
        Profile pf = [Select Name,Id From Profile Where Name = :PROFILENAME];
        User us = new user(Username='user@acme.org',
                           RH_ContactId__c=con.Id,
                           LastName='Lastname ', 
                           Alias='alias ', 
                           Email='user@mail.org', 
                           TimeZoneSidKey='Pacific/Apia',
                           LocaleSidKey='eu_ES',
                           EmailEncodingKey='UTF-8', 
                           Profile = pf, 
                           ProfileId=pf.Id,
                           LanguageLocaleKey='en_US');
        
        insert us;
        Event__c ev = new Event__c(Name='Azerty',
                                   Contact_Id__c=us.RH_ContactId__c,
                                   Description__c='description',
                                   Start_Date__c=system.Today()+1,
                                   End_Dates__c=system.Today()+1,
                                   Status__c='Approved',
                                   Message__c=''
                                   );
        insert ev;
        ContentVersion cv = new Contentversion(); 
        cv.Title = 'file.csv'; 
        cv.PathOnClient = 'test'; 
        cv.VersionData = EncodingUtil.base64Decode('Unit Test Attachment Body'); 
        List<ContentVersion> cvl = new List<ContentVersion>(); 
        cvl.add(cv); 
        insert cvl;
    }

    @isTest static void TestgetEventListCEOza(){
        Test.startTest();
        try{
            List<Event__c> events1 = RH_EventController.getEventList();
            // System.assertEquals(null, events1.size());
        }catch(exception e){}     
        Test.stopTest();
    }
    
    @isTest static void TestgetMyEventManager(){
        Test.startTest();
            try{
                List<Event__c> events3 = RH_EventController.getMyEventManager();
            }catch(exception e){}     
            Test.stopTest();
    }
      
    
    @isTest static void TestgetEventList2(){
        Event__c e = [SELECT Id,Contact_Id__c,Message__c From Event__c ];
        String obj = '{"Name":"azerty","Contact_Id__c":"0037Q000007I2h0QAC","Description__c":"gtregrgh","Start_Dates__c":"2022-06-14T14:18:00.000Z","End_Dates__c":"2022-06-14T14:18:00.000Z","Status__c":"","Id":"a087Q000000OyArQAK"}';
        
        List<Event__c> events4 = RH_EventController.saveAndSendEvent(obj, e.Id);
        List<Event__c> events5 = RH_EventController.saveEvent(obj, e.Id);
        List<Event__c> events6 = RH_EventController.sendEvent(e.Id);
        List<Event__c> events7 = RH_EventController.updateEven(obj, e.Id);
        List<Event__c> events8 = RH_EventController.updateAndSendEven(obj, e.Id);
        List<Event__c> events9 = RH_EventController.deleteEvent(e.Id);
        List<Event__c> events10 = RH_EventController.changeEventStatus(e.Id);
        List<Event__c> events11 = RH_EventController.getEventInfos(e.Id);
        List<Event__c> events12 = RH_EventController.getMyLastEvent(10);

        List<RH_EventController.SelectOptionObj> pkls = RH_EventController.getPicklistStatus();

        Event__c event3 = RH_EventController.checkStatus(e.Id);

        List<User> users1 = RH_EventController.getIdUserCEO();
        List<User> users2 = RH_EventController.getInfBaseUsers();
        List<User> users3 = RH_EventController.getIdUser('0057Q000003kutbQAA');

        String str = RH_EventController.getUserInfoId();
        
        List<ContentVersion> cvl = [Select Id,Title,PathOnClient,VersionData From ContentVersion];
        String str2 = RH_EventController.uploadFile(cvl[0].PathOnClient,cvl[0].Title,e.Id);
    }
    @isTest static void TestgetEventEdite(){
        Event__c e = [Select Id,Message__c From Event__c];
        List<Event__c> events2 = RH_EventController.getEventEdite(e.Id);
        
    }
    @isTest static void TestgetEvent(){
        Contact con = [Select id From Contact Limit 1];
        system.debug('@@@@ ---> con: ' + con.Id);
        User u = [Select Id,RH_ContactId__c,Username,UserRole.Name From User Where Username='user@acme.org' Limit 1];
        system.debug('@@@@ ---> user: ' + u);
        system.runAs(u){
            String obj = '{"Name":"test123","StartDate":"2022-06-17T14:55:00.000Z","Description":"description","EndDate":"2022-06-17T15:00:00.000Z"}';
            Test.startTest();
            try{
                Event__c event1 = RH_EventController.saveEvenWithoutStatus(obj);
                System.assert(event1 != null);
                System.assertEquals(event1.Description__c, 'description');
            }
            catch(exception e){}     
            Test.stopTest();
        }
    }
    @isTest static void TestgetVoidEvent(){
        Event__c e = [Select Id From Event__c];
        Event__c event1 = RH_EventController.getEvent(e.Id);
        RH_EventController.cancelEven(e.Id);
        RH_EventController.getInfoUsers();
        RH_EventController.deleteFile('0697Q000000ZTsNQAW', '0697Q000000ZTsNQAW');
    }
    @isTest static void TestgetMap(){
        Map<String, Object> strMap = RH_EventController.getRelatedFilesByRecordId('0697Q000000ZTsNQAW');
    }
    @isTest static void TestSendNotification(){
        Event__c e = [Select Id,Message__c From Event__c];
        List<String> strs = new List<String>();
        strs.add('0037Q000007I2h0QAC');
        RH_EventController.sendNotifications('EventDescription',e.Id,'0057Q000003kutbQAA','0057Q000003kutbQAA','EventName',strs);
    }
}