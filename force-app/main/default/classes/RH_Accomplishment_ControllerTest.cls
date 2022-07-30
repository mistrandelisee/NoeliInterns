@isTest
public class RH_Accomplishment_ControllerTest {
    @TestSetup
    static void setup(){
        //create Profile test
        Profile profileId = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
        
     	 User usr = new User(Username = 'jason.liveston@asdf.com', ProfileId = profileId.id, RH_ContactId__c = 'Bummm', CommunityNickname = 'Bamm');

            RH_Accomplishment__c rh = new RH_Accomplishment__c(RH_Status__c = 'Draft'); 
            insert rh; 
            
            Contact acc = new Contact(LastName = 'Bien'); 
            insert acc;  
    }
    
    @isTest
    static void accomplishmentDetailTest() {
        RH_Accomplishment__c RH_A = [SELECT Id FROM RH_Accomplishment__c];
        RH_Accomplishment__c res = RH_Accomplishment_Controller.accomplishmentDetail(RH_A.Id);
    } 

    @isTest
    static void getAccomplishmentTest() {
        List<RH_Accomplishment__c> res = RH_Accomplishment_Controller.getAccomplishment();
    }
    
    
    @isTest
    static void getMyAccomplishmentTest() {
        List<RH_Accomplishment__c> ress = RH_Accomplishment_Controller.getMyAccomplishment(150);
    }
    
    @isTest
    static void checkCurrentContactTest() {
        List<RH_Accomplishment__c> cont = [SELECT Id FROM RH_Accomplishment__c];
        Boolean ress = RH_Accomplishment_Controller.checkCurrentContact(cont[0].Id);
    }
    
    @isTest
    static void checkCurrentContact1Test() {
        List<RH_Accomplishment__c> cont = [SELECT Id FROM RH_Accomplishment__c];
        try {
        	Boolean ress = RH_Accomplishment_Controller.checkCurrentContact('');
        }
        catch(Exception e) {
            System.debug(e.getMessage());
        }
    }
        
    @isTest
    static void addAccomplishmentTest() {
        RH_Accomplishment_Controller.Accomplishmentdetailswrapper addAcco = new RH_Accomplishment_Controller.Accomplishmentdetailswrapper();
        	addAcco.description = 'descriptionTest'; 
            addAcco.title = 'titleTest'; 
            addAcco.visibility = true; 
            addAcco.myDate =  Date.today();
        String str = JSON.serialize(addAcco);
        List<RH_Accomplishment__c> MapTest = [SELECT Id,RH_Status__c FROM RH_Accomplishment__c];
        Map<String,Object> addAcc = RH_Accomplishment_Controller.addAccomplishment(str, MapTest[0].Id, MapTest[0].RH_Status__c);
    }
    
    @isTest
    static void addAccomplishment1Test() {
        RH_Accomplishment_Controller.Accomplishmentdetailswrapper addAcco = new RH_Accomplishment_Controller.Accomplishmentdetailswrapper();
        	addAcco.description = 'descriptionTest'; 
            addAcco.title = 'titleTest'; 
            addAcco.visibility = true; 
            addAcco.myDate =  Date.today();
        String str = JSON.serialize(addAcco);
        List<RH_Accomplishment__c> MapTest = [SELECT Id,RH_Status__c FROM RH_Accomplishment__c];
        Map<String,Object> addAcc = RH_Accomplishment_Controller.addAccomplishment(str,  MapTest[0].RH_Status__c, '');
    }
    
    @isTest
    static void activateAccomplishmentTest() {
        RH_Accomplishment__c ActiveTest = [SELECT Id,RH_Description__c,RH_Status__c FROM RH_Accomplishment__c];
        try {
       	RH_Accomplishment_Controller.activateAccomplishment(ActiveTest.RH_Description__c, ActiveTest.RH_Status__c);
        }catch(Exception e) {
            System.debug(e.getMessage());
        }
    }
    
    @isTest
    static void deleteAccomplishmentTest() {
        RH_Accomplishment__c deleteTest = [SELECT Id,RH_Status__c FROM RH_Accomplishment__c];
       	RH_Accomplishment_Controller.deleteAccomplishment(deleteTest.Id);
    }
}