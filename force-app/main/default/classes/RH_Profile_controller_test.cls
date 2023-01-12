@istest
public with sharing class RH_Profile_controller_test {
    
    @TestSetup
    static void makeData(){

    String PROFILENAME = 'Custom Identity User';

        
    //Id currentUserProfileId = UserInfo.getProfileId();
    
    Profile pf = [Select Name,Id From Profile Where Name = :PROFILENAME];

    Contact ct = new Contact(LastName = 'zezeers', email = 'ctc@mail.fr' ); 

    insert ct;

    Contact ct2 = new Contact(LastName = 'zoro', email = 'zabac@mail.fr' ); 

    insert ct2;
    
    
    User us = new user(Username='user@acme.org',RH_ContactId__c=ct.Id, LastName='Lastname ', Alias='alias ', Email='user@mail.org', TimeZoneSidKey='Pacific/Apia',LocaleSidKey='eu_ES',EmailEncodingKey='UTF-8', Profile = pf, ProfileId=pf.Id ,LanguageLocaleKey='en_US');
    
    insert us;

    }
    
    @istest
    static void testgetMyProfilePass() {

        user us = [Select Name,Id,RH_ContactId__c from user where Username = 'user@acme.org'];

        contact ct = [Select LastName,Id FROM contact WHERE Id = : us.RH_ContactId__c ];

        // System.debug('*/*/*/* Contact */*/*/' +ct);
        
        system.runAs(us){

            contact ct3 = new Contact(LastName = 'zora', email = 'zobac@mail.fr' ); 

            insert ct3;

            us.RH_ContactId__c = ct3.Id;

            update us;

            Map<string,object> ProfileMap = RH_Profile_controller.getMyProfile();


            // System.debug('-------- Profile map '+ProfileMap);

            string cp = JSON.serialize(ProfileMap.get('contact'));

            contact p = (contact) JSON.deserialize(cp, contact.class);

            // string name = Cp.Name;

            System.assertEquals('zora',p.Name);
        }
       
    }

    @istest
    static void testgetMyProfileFail() {
       
        Map<string,object> ProfileMap = RH_Profile_controller.getMyProfile();
    
        System.assertEquals(true,ProfileMap.get('error'));
    }

    @istest
    static void testUpdateInfo() {

        user us = [Select Name,Id,Profile.Name,RH_ContactId__c from user where Username = 'user@acme.org'];
        // System.debug('&&&&&& us'+us.Profile.Name);

        system.runAs(us){
            
            RH_Profile_controller.contactdetailswrapper ct = new RH_Profile_controller.contactdetailswrapper();

            RH_Profile_controller.Address ad = new RH_Profile_controller.Address();
            
            ad.Country = 'Cameroun';
            ad.City = 'Yaounde';
            ad.Province = 'Centre';
            ad.Postal = '114';
            ad.Street = 'StLouis';

            ct.LastName = 'Lname';
            ct.FirstName = 'Fname'; 
            ct.Email = 'mail@mail.com'; 
            ct.Phone = '444-556-987-567'; 
            ct.Description = 'Description'; 
            ct.Address = ad;
            ct.Birthday = Date.newInstance(2022, 12, 09);
            
            String cJson = JSON.serialize(ct);

            System.debug('!!!!! Cjson : '+cJson);

            Contact ctc = new Contact(LastName = 'pknkjlk');

            insert ctc;

            contact ct3 = new Contact(LastName = 'zoro', email = 'zabac@mail.fr' ); 

            insert ct3;

            us.RH_ContactId__c = ct3.Id;

            update us;

            Map<string,object> InfoMap = RH_Profile_controller.UpdateInfo(ctc.Id, cJson);  

            string cp = JSON.serialize(InfoMap.get('contact'));

            contact p = (contact) JSON.deserialize(cp, contact.class);

            // string name = Cp.Name;

            System.assertEquals('zoro',p.Name);

        }
    }

    @istest
    static void testUpdateInfoFail() {

        user us = [Select Name,Id,Profile.Name,RH_ContactId__c from user where Username = 'user@acme.org'];
        System.debug('&&&&&& us'+us.Profile.Name);

        system.runAs(us){
            
            contact ct = new Contact(LastName = 'zoro', email = 'zabac@mail.fr' ); 

            insert ct;
            
            String cJson = JSON.serialize(ct);

            Contact ctc = new Contact(LastName = 'pknkjlk');

            insert ctc;


            Map<string,object> InfoMap = RH_Profile_controller.UpdateInfo(ctc.Id, cJson);  

            System.assertEquals(true,InfoMap.get('error'));

        }
    }

    @istest
    static void testupdateUser() {

        contact ctc = [SELECT LastName,Id,Email FROM contact][1];

        RH_Profile_controller.updateUser(ctc.id, JSON.serialize(ctc));

        list<user> usr = [SELECT Id,Name,RH_ContactId__c FROM user];

        system.debug('#### list of update usr ####'+usr);

        // System.assertEquals(usr.RH_ContactId__c,ctc.Id);

        // System.assertEquals('',);
    }

    @istest
    static void testUpdateExtraInfo() {

        String extra = 'Dolor ullamco deserunt eu cupidatat amet culpa velit aute.';

        user usr = [SELECT Id,Name,RH_ContactId__c FROM user][0];

        Map<string, object> InfoMap = RH_Profile_controller.UpdateExtraInfo(usr.RH_ContactId__c,extra);

        System.assertEquals(InfoMap.get('input'), extra);

    }

    @istest
    static void testchangeMyPassword() {

        RH_Profile_controller.changepasswordwrapper psd = new RH_Profile_controller.changepasswordwrapper();

        psd.newPassword = '644cdgyeza';

        psd.verifyNewPassword = '&gegeçà_çè}';

        psd.oldpassword = 'uhgjkhe';

        String pass = JSON.serialize(psd);

        Map<String, object> passMap = RH_Profile_controller.changeMyPassword(pass);

        System.assertEquals(true, passMap.get('Ok'));

    }


    @istest
    static void testchangeMyPasswordFail() {

        String pass = 'nhgiuvhfdujs151';

        Map<String, object> passMap = RH_Profile_controller.changeMyPassword(pass);

        System.assertEquals(true, passMap.get('error'));

    }

    @istest
    static void testgetContact() {
        
        user us = [SELECT Id,Name FROM user][0];

        System.runAs(us){

           list<RH_Profile_controller.ContactWrapper> listcon = RH_Profile_controller.getContact();

           System.assertEquals(1, listcon.size());

        }
       
    }

    @istest
    static void testgetContactFail() {
        
        list<RH_Profile_controller.ContactWrapper> listcon = RH_Profile_controller.getContact();

        System.assertEquals(1, listcon.size());
    }


}