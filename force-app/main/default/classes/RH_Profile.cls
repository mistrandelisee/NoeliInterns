public  class RH_Profile {
    public RH_Profile() {
    }
    @AuraEnabled
    public static Map<string,object> getMyProfile() {
        Map<string,object> mapReturn = new Map<String, Object>();
        User u= [SELECT id,Name,Username,RH_ContactId__c FROM User WHERE Id=: Userinfo.getUserId()];
        mapReturn.put('user', u);
        mapReturn.put('error', false);
        if (String.isBlank(u?.RH_ContactId__c)) {
                mapReturn.put('error', true);
                mapReturn.put('msg','Missing Contact');
                return mapReturn;
        }
        Contact userContact=[SELECT LastName,AccountId,RH_Role__c, FirstName,RH_User__c,Email,MailingCity,Languages__c,RH_Extra_Infos__c FROM Contact WHERE Id=:u.RH_ContactId__c];
        mapReturn.put('contact', userContact);
        return mapReturn;
    }
    @AuraEnabled
    public static Map<String,Object> newUser(String contactjson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            mapReturn.put('input',contactjson);  
            contactdetailswrapper contactinfo = (contactdetailswrapper) JSON.deserialize(contactjson, contactdetailswrapper.class);
            contact conctactUser =contactinfo.getcontact();
            conctactUser.recordTypeId=RH_Constans.RH_CONTACT_RT;
            mapReturn.put('conctactUser',conctactUser);
            //insert conctactUser;
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }
       
        return mapReturn;
    }
    @AuraEnabled
    public static Map<String,Object> changeMyPassword(String changepasswordjson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            mapReturn.put('input',changepasswordjson);
            changepasswordwrapper pwdResetter = (changepasswordwrapper) JSON.deserialize(changepasswordjson, changepasswordwrapper.class);
            PageReference pr=pwdResetter.changePassword();
            // String newPassword='0037Q000007I2h0QACwqaa';
            // String verifyNewPassword='0037Q000007I2h0QACwqaa';
            // String oldpassword='0037Q000007I2h0QACwqa'; 
            mapReturn.put('Ok',true);
            mapReturn.put('prUrl',pr.getUrl());
            //coninsert conctactUser;
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }
        return mapReturn;
    }
    public class contactdetailswrapper  {
        @AuraEnabled public String LastName;
        @AuraEnabled public String FirstName;
        @AuraEnabled public String Email;
        public Contact getcontact() {
            return new Contact(
                lastname=this.lastname, 
                firstname=this.firstname, 
                email=this.email);
        }
    }
    public class changepasswordwrapper  {
        @AuraEnabled public String newPassword;
        @AuraEnabled public String verifyNewPassword;
        @AuraEnabled public String oldpassword;
        public PageReference changePassword() {
            return Site.changePassword(newPassword, verifyNewPassword, oldpassword);
        }
    }
}