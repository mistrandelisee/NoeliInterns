@istest
public with sharing class RH_Profile_controller_test {
    
    @TestSetup
    static void makeData(){

    String PROFILENAME = 'Custom Identity User';

        
    //Id currentUserProfileId = UserInfo.getProfileId();
    
    Profile pf = [Select Name,Id From Profile Where Name = :PROFILENAME];

    Contact ct = new Contact(LastName = 'zezeers'); 

    insert ct;
    
    User us = new user(Username='user@acme.org',RH_ContactId__c=ct.Id, LastName='Lastname ', Alias='alias ', Email='user@mail.org', TimeZoneSidKey='Pacific/Apia',LocaleSidKey='eu_ES',EmailEncodingKey='UTF-8', Profile = pf, ProfileId=pf.Id ,LanguageLocaleKey='en_US');
    
    insert us;

    }
    
    @istest
    static void testgetMyProfilePass() {

        user us = [Select Name,Id from user where Username = 'user@acme.org'];
        
        system.runAs(us){
            RH_Profile_controller.getMyProfile();
        }
       
    }

    @istest
    static void testgetMyProfileFail() {
        RH_Profile_controller.getMyProfile();
    }

    @istest
    static void testUpdateInfo() {

        user us = [Select Name,Id,Profile.Name from user where Username = 'user@acme.org'];
        System.debug('&&&&&& us'+us.Profile.Name);

        system.runAs(us){
            
            Contact ct = new Contact(LastName = 'Lname', FirstName = 'Fname', Email = 'mail@mail.com', Phone = '444-556-987-567', Description = 'Description' );
            
            String cJson = JSON.serialize(ct);

            Contact ctc = new Contact(LastName = 'pknkjlk');

            insert ctc;

            RH_Profile_controller.UpdateInfo(ctc.Id, cJson);

        }

        


    }
   
}