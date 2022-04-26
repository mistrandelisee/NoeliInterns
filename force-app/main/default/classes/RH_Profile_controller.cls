public  class RH_Profile_controller {
    public RH_Profile_controller() {
    }
    // RH_Profile_controller.getMyProfile();
    // System.debug(RH_Contact_Query.getInstance().getContactById('0037Q000007I2h0QAC'));
    private static RH_User_Query userQry = RH_User_Query.getInstance();
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();

    @AuraEnabled
    public static Map<string,object> getMyProfile() {
        Map<string,object> mapReturn = new Map<String, Object>();
        mapReturn.put('error', false);
        try {
            List<User> users=userQry.getUserById(Userinfo.getUserId());
            if (users.isEmpty()) throw new RH_ControllerException('001','Missing User');
            User u=users[0];
            if (String.isBlank(u.RH_ContactId__c)) {
                throw new RH_ControllerException('002','This user is not a link to any RH Contact');
            }
            
            mapReturn.put('user', u);
            List<Contact> userContacts=contactQry.getContactById(u.RH_ContactId__c);
            if (userContacts.isEmpty()) throw new RH_ControllerException('002','No RH Contact Founded');

            Contact userContact=userContacts[0];
            mapReturn.put('contact', userContact);
            mapReturn.put('account', userContact.Account);
            mapReturn.put('myGroup', userContact.RH_WorkGroup__r);
            mapReturn.put('myLeadedGroups', userContact.WorkGroups_Leader__r);
            }
        catch(RH_ControllerException ce) {
            System.debug('@@@@@@@@@@@@@RH_Profile_controller::getMyProfile:: RH_ControllerException>> '+ce.getMessage());
            mapReturn.put('error', true);
            mapReturn.put('code', ce.getCode());
            mapReturn.put('msg',ce.getMessage());
        }
        catch(Exception e) {
            System.debug('@@@@@@@@@@@@@RH_Profile_controller::getMyProfile:: Exception>> '+e.getMessage());
            mapReturn.put('error', true);
            mapReturn.put('msg',e.getMessage());
        }
        System.debug('log ' + mapReturn);
        
        return mapReturn;
    }
    private static void getContactDetails(User u, Map<String, Object> mapReturn){
        List<Contact> userContacts=contactQry.getContactById(u.RH_ContactId__c);
        if (userContacts.isEmpty()) throw new RH_ControllerException('002','No RH Contact Founded');

        Contact userContact=userContacts[0];
        mapReturn.put('contact', userContact);
        mapReturn.put('user', u);
        mapReturn.put('account', userContact.Account);
        mapReturn.put('myGroup', userContact.RH_WorkGroup__r);
        mapReturn.put('myLeadedGroups', userContact.WorkGroups_Leader__r);
    }
    @AuraEnabled
    public static Map<String,Object> UpdateInfo(String recordId,String contactjson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            mapReturn.put('input',contactjson);
            contactdetailswrapper contactinfo = (contactdetailswrapper) JSON.deserialize(contactjson, contactdetailswrapper.class);
            //update contact
            contact conctactUser =contactinfo.getcontact();
            conctactUser.recordTypeId=RH_Constans.RH_CONTACT_RT;
            conctactUser.RH_User__c=Userinfo.getUserId();
            conctactUser.Id=recordId;
           
            update  conctactUser;
            mapReturn.put('conctactUser',conctactUser);
            //update user
            updateUser(recordId,contactjson);
            //mapReturn.put('out_user',u);  
            //mapReturn.put('out_contact',conctactUser);  
            mapReturn.putAll(getMyProfile()); 
           //getContactDetails(u,mapReturn);
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }
       
        return mapReturn;
    }
    @future
    public static void updateUser(String recordId,String contactjson) {
        contactdetailswrapper contactinfo = (contactdetailswrapper) JSON.deserialize(contactjson, contactdetailswrapper.class);
        user u =contactinfo.getUser();
        u.RH_ContactId__c=recordId;
        u.Id=Userinfo.getUserId();
        update u;
    }
    @AuraEnabled
    public static Map<String,Object> UpdateExtraInfo(String recordId,String extraInfo){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            mapReturn.put('input',extraInfo);  
            contact conctactUser = new contact(Id=recordId,RH_Extra_Infos__c=extraInfo);
            update conctactUser;
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }
       
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
            //Uncomment Later
            PageReference pr=pwdResetter.changePassword();
            
            // String newPassword='0037Q000007I2h0QACwqaa';
            // String verifyNewPassword='0037Q000007I2h0QACwqaa';
            // String oldpassword='0037Q000007I2h0QACwqa'; 
            mapReturn.put('Ok',true);
            //mapReturn.put('prUrl',pr.getUrl());
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
        // @AuraEnabled public String Role;
        @AuraEnabled public string AccountId;
        // @AuraEnabled public string Login;
        @AuraEnabled public string City;
        @AuraEnabled public Date Birthday;
        @AuraEnabled public String Phone;
        @AuraEnabled public String Description;
        public Contact getcontact() {
            return new Contact(
                lastname=this.lastname, 
                firstname=this.firstname, 
                email=this.email,
                // RH_Role__c=this.Role,
                // AccountId=this.AccountId,
                Birthdate=Birthday,
                Description=Description,
                Phone=Phone
                );
        }
        public User getUser() {
            return new User(
                lastname=this.lastname, 
                firstname=this.firstname, 
                email=this.email,
                // Username=Login,
                Phone=Phone
                );
        }
    }

    @AuraEnabled 
    public static List<ContactWrapper> getContact(){
        List<ContactWrapper> listcon = new List<ContactWrapper>();
        List<String> listcontactId = new List<String>();
        List<User> users=userQry.getUser();
        if (users.size()>0){
            for(User u : users ){
                String conId;
                conId = u.RH_ContactId__c;
                listcontactId.add(conId);
            }
        }else{
            throw new RH_ControllerException('004','No User for This Profile Founded');
        }
              
        List<Contact> userContacts=contactQry.getContact(listcontactId);
            if (userContacts.size()>0){
                listcon = populateContact(userContacts);
            }else{
                throw new RH_ControllerException('002','No RH Contact Founded');
            }      
            return listcon;
    }

    private static List<ContactWrapper> populateContact(List<Contact> conlist){
        List<ContactWrapper> listcon = new List<ContactWrapper>();
        
        for(Contact con : conlist){
            ContactWrapper c = new ContactWrapper();
            c.LastName = con.LastName;
            c.FirstName = con.FirstName;
            c.accountName = con.Account.Name;
            c.RHRolec = con.RH_Role__c;
            c.RHUser = con.RH_User__c;
            c.id = con.Id;
            listcon.add(c);
        }
        return listcon;
    }

    /*public class contactdetailswrapper  {
        @AuraEnabled public String LastName;
        @AuraEnabled public String FirstName;
        @AuraEnabled public String Email;
        @AuraEnabled public String Role;
        @AuraEnabled public string AccountId;
        public Contact getcontact() {
            return new Contact(
                lastname=this.lastname, 
                firstname=this.firstname, 
                email=this.email,
                RH_Role__c=this.Role,
                AccountId=this.AccountId);
        }
    }*/
    public class ContactWrapper {
        @AuraEnabled public String LastName{get;set;}
        @AuraEnabled public String RHRolec{get;set;}
        @AuraEnabled public String FirstName{get;set;}
        @AuraEnabled public String RHUser{get;set;}
        @AuraEnabled public String accountName{get;set;}
        @AuraEnabled public String id {get;set;}
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