@isTest
public class RH_Request_controllerTest {
    @TestSetup
    static void setup(){
        //create Profile test
        Profile profileId = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
        
     	 User usr = new User(Username = 'baout.gougou@vane.com', ProfileId = profileId.id, RH_ContactId__c = 'pummm', CommunityNickname = 'pamm');

            RH_Request__c request = new RH_Request__c(RH_Status__c = 'Draft'); 
            insert request; 
            
            Contact cont = new Contact(LastName = 'PourTest'); 
            insert cont;  
    }
    
    @isTest
    static void getLastrequestTest() {
        RH_Request__c RH_last = [SELECT Id, Name FROM RH_Request__c];
        //List<RH_Request__c> res = RH_Request_controller.getLastrequest(1);
    }
        
    @isTest
    static void getrequestTest() {
        RH_Request__c RH_re = [SELECT Id FROM RH_Request__c];
        List<RH_Request__c> resq = RH_Request_controller.getrequest();
    }
    
    @isTest
    static void getRequestToManageTest() {
        RH_Request__c RH_re = [SELECT Id FROM RH_Request__c];
        List<RH_Request__c> resqu = RH_Request_controller.getRequestToManage();
    }
    
    /*@isTest
    static void getAdressedTo() {
        Contact RH_re = [SELECT Id FROM Contact];
        List<Contact> resqu = RH_Request_controller.getAdressedTo();
    }*/
    
    @isTest
    static void retreiveRequestTest() {
        RH_Request__c RH_re = [SELECT Id, Name FROM RH_Request__c];
       	RH_Request__c resqu = RH_Request_controller.retreiveRequest(RH_re.Id);
    }
    
    @isTest
    static void deleteRequestTest() {
        RH_Request__c RH_del = [SELECT Id, Name FROM RH_Request__c];
       	string resque = RH_Request_controller.deleteRequest(RH_del.Id);
    }
    
    @isTest
    static void updateRequestTest() {
        RH_Request__c RH_up = [SELECT Id, Name FROM RH_Request__c];
       	string resque = RH_Request_controller.updateRequest(RH_up.Id);
    }
    
    @isTest
    static void newRequestTest() {
        RH_Request_controller.Requestdetailswrapper newReque = new RH_Request_controller.Requestdetailswrapper();
        	newReque.StatusRequest = 'StatusRequestTest'; 
            newReque.RH_StartDate = Date.today(); 
            newReque.RH_EndDate = Date.today(); 
            newReque.RH_AddressedTo =  'RH_AddressedToTest';
            newReque.RH_AddressedCc =  'RH_AddressedCcTest';
            newReque.RH_Description =  'descriptionTest';
            newReque.RecordT = 'RecordTTest' ;
            newReque.ComplainOn =  'ComplainOnTest';
        String str = JSON.serialize(newReque);
        List<RH_Request__c> MapRequestTest = [SELECT Id,RH_Status__c FROM RH_Request__c];
        Map<String,Object> newtest = RH_Request_controller.newRequest(str);
    }
    
    @isTest
    static void updateRequestForRejetTest() {
        RH_Request_controller.Requestdetailswrapper updateReque = new RH_Request_controller.Requestdetailswrapper();
        	updateReque.StatusRequest = 'StatusRequestTest'; 
            updateReque.RH_StartDate = Date.today(); 
            updateReque.RH_EndDate = Date.today(); 
            updateReque.RH_AddressedTo =  'RH_AddressedToTest';
            updateReque.RH_AddressedCc =  'RH_AddressedCcTest';
            updateReque.RH_Description =  'descriptionTest';
            updateReque.RecordT = 'RecordTTest' ;
            updateReque.ComplainOn =  'ComplainOnTest';
        String str = JSON.serialize(updateReque);
        List<RH_Request__c> MapRequestupTest = [SELECT Id,RH_Status__c FROM RH_Request__c];
        Map<String,Object> updateTest = RH_Request_controller.updateRequestForRejet(str, MapRequestupTest[0].Id, MapRequestupTest[0].RH_Status__c);
    }
    
    @isTest
    static void updateRequestForRejetTest1() {
        RH_Request_controller.Requestdetailswrapper updateReque = new RH_Request_controller.Requestdetailswrapper();
        	updateReque.StatusRequest = 'StatusRequestTest'; 
            updateReque.RH_StartDate = Date.today(); 
            updateReque.RH_EndDate = Date.today(); 
            updateReque.RH_AddressedTo =  'RH_AddressedToTest';
            updateReque.RH_AddressedCc =  'RH_AddressedCcTest';
            updateReque.RH_Description =  'descriptionTest';
            updateReque.RecordT = 'RecordTTest' ;
            updateReque.ComplainOn =  'ComplainOnTest';
        String str = JSON.serialize(updateReque);
        List<RH_Request__c> MapRequestupTest = [SELECT Id,RH_Status__c FROM RH_Request__c];
        Map<String,Object> updateTest = RH_Request_controller.updateRequestForRejet(str, '', MapRequestupTest[0].RH_Status__c);
    }
    
    @isTest
    static void updateRequestForApproveTest() {
        RH_Request_controller.Requestdetailswrapper updateRequest = new RH_Request_controller.Requestdetailswrapper();
        	updateRequest.StatusRequest = 'StatusRequestTest'; 
            updateRequest.RH_StartDate = Date.today(); 
            updateRequest.RH_EndDate = Date.today(); 
            updateRequest.RH_AddressedTo =  'RH_AddressedToTest';
            updateRequest.RH_AddressedCc =  'RH_AddressedCcTest';
            updateRequest.RH_Description =  'descriptionTest';
            updateRequest.RecordT = 'RecordTTest' ;
            updateRequest.ComplainOn =  'ComplainOnTest';
        String str = JSON.serialize(updateRequest);
        List<RH_Request__c> MapRequestupForTest = [SELECT Id,RH_Status__c FROM RH_Request__c];
        Map<String,Object> updateForTest = RH_Request_controller.updateRequestForApprove(str, MapRequestupForTest[0].Id, MapRequestupForTest[0].RH_Status__c);
    }
    
    @isTest
    static void updateRequestForApprove1Test() {
        RH_Request_controller.Requestdetailswrapper updateRequest = new RH_Request_controller.Requestdetailswrapper();
        	updateRequest.StatusRequest = 'StatusRequestTest'; 
            updateRequest.RH_StartDate = Date.today(); 
            updateRequest.RH_EndDate = Date.today(); 
            updateRequest.RH_AddressedTo =  'RH_AddressedToTest';
            updateRequest.RH_AddressedCc =  'RH_AddressedCcTest';
            updateRequest.RH_Description =  'descriptionTest';
            updateRequest.RecordT = 'RecordTTest' ;
            updateRequest.ComplainOn =  'ComplainOnTest';
        String str = JSON.serialize(updateRequest);
        List<RH_Request__c> MapRequestupForTest = [SELECT Id,RH_Status__c FROM RH_Request__c];
        Map<String,Object> updateForTest = RH_Request_controller.updateRequestForApprove(str,'', MapRequestupForTest[0].RH_Status__c);
    }
    
    /*@isTest
    static void sendNotificationsTest() {
        RH_Request__c RH_re = [SELECT Id, Name FROM RH_Request__c];
        RH_Request__c resqu = RH_Request_controller.sendNotifications(RH_re.Id, RH_re.strBody, RH_re.strSenderId, RH_re.pgRefId, RH_re.strTargetId, RH_re.strTitle, RH_re.setUserIds);
    }*/
}