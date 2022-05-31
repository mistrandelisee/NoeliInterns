@isTest
public with sharing class RH_EventControllerTest {
    @testSetup
    static void setup() {
        Contact con = new Contact(LastName='Ndon',FirstName='Will');
        insert con;
        User u = new User(
            Username='autoproc@00d7q000005ytvlua0',
            LastName='Process',
            RH_ContactId__c=con.Id);
        insert u;
        Event__c ev = new Event__c(Name='Azerty',
                                   Contact_Id__c=u.RH_ContactId__c,
                                   Description__c='description',
                                   Start_Date__c=system.Today()+1,
                                   Status__c='Draft'
                                   );
        insert ev;
    }

    @isTest static void TestgetEventList(){
        List<Event__c> events = RH_EventController.getEventList();
    }
    @isTest static void TestgetEvent(){
        Event__c e = [Select Id From Event__c];
        Event__c events = RH_EventController.getEvent(e.Id);
    }
}