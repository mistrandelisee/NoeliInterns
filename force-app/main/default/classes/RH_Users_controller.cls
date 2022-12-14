public without sharing class RH_Users_controller {
    private static RH_User_Query userQry = RH_User_Query.getInstance();
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();
    private static RH_WorkGroup_Query workGroupQry = RH_WorkGroup_Query.getInstance();
    
    public static Map<String, String> mapContactToUser = new Map<String, String>();
    static string myconId='';

    /* Kbrel Add 17/06/2022 
        Change the language of the  community 
     */
    @AuraEnabled
    public static User changeLanguage(String lang) {
        User userInfo = userQry.getUserInfoId();
        userInfo.LanguageLocaleKey = lang;
        update userInfo;
        return userInfo;
    }

    @AuraEnabled
    public static Map<String,Object> getUserLanguage() {
        User userInfo =userQry.getUserInfoId();
        Map<String,String> picklistLang= new Map<String,String>();

        // Take a value of pickList from org
        /* 
        List<Schema.PicklistEntry> picklistValues = User.LanguageLocaleKey.getDescribe().getPicklistValues();
        for (Schema.PicklistEntry picklistEntry : picklistValues) {
            System.debug('picklistEntry : ' + picklistEntry);
            if(picklistEntry.isActive()==true){
                picklistLang.put(picklistEntry.getLabel(), picklistEntry.getValue());
            }    
        }
        */
        return new Map<String,Object>{
            'lang'=> picklistLang,
            'userInfo' => userInfo
        } ;
    }


    @AuraEnabled 
    public static Map<String,Object>  checkUserCreation(String conID){
        Map<String, Object> mapReturn = new Map<String, Object>();
        
        List<String> listcontactId = new List<String>();
        mapReturn.put('error',false);
        try {
            List<User> users = userQry.getUserByContactId(conID);
            mapReturn.put('Ok', !users.isEmpty());
            mapReturn.put('users', users);
            if (!users.isEmpty()) {
                update new contact(RH_User__c=users[0].Id,Id=conId);
            }
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    
    
    }
    @AuraEnabled 
    public static Map<String,Object>  getContacts(String filterTxt){
        Map<String, Object> mapReturn = new Map<String, Object>();
        List<Map<String, Object>> listcon = new List<Map<String, Object>>();
        mapReturn.put('error',false);
        try {
            
            mapReturn.put('filterTxt',filterTxt); 
            ContactFilterWrapper filter= (ContactFilterWrapper) JSON.deserialize(filterTxt, ContactFilterWrapper.class); 
            Map<Id, Contact> mapContacts=contactQry.getFilteredContacts(filter);
            
            List<User> users=userQry.getOtherUsersByContactIds(new List<Id>(mapContacts.keySet()));
            if (users.size()>0){
                for(User u : users ){
                    String conId;
                    if (Userinfo.getUserId() == u.Id) {
                        myconId=u.RH_ContactId__c;
                    }
                    conId = u.RH_ContactId__c;
                    if (String.isNotBlank(conId)) {
                        mapContactToUser.put(conId,u.Id);
                    }
                }
            }
            // else{
            //     throw new RH_ControllerException('004','No User for This Profile Founded');
            // }
                if (mapContacts.values().size()>0){
                    listcon = populateContact(mapContacts.values());
                }
                else{
                    // throw new RH_ControllerException('002','No Records Founded');
                    throw new RH_ControllerException('002',label.rh_recordNotFounded);
                } 
            mapReturn.put('Employes',listcon); 
            mapReturn.put('in',filter); 
            // mapReturn.put('users',users); 
            mapReturn.put('Constants',RH_Constans.getAllConstants()); 

            mapReturn.putAll(RH_Utility.checkRole()); 
            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('msgLine',e.getStackTraceString());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    }
    @AuraEnabled 
    public static Map<String,Object>  InitFilter(){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            List<RH_Utility.PickOption> OrderBys = new List<RH_Utility.PickOption>();
            OrderBys.add(new RH_Utility.PickOption('None', ''));
            OrderBys.add(new RH_Utility.PickOption(label.rh_CreatedDate, 'CreatedDate'));
            OrderBys.add(new RH_Utility.PickOption(label.rh_Name, 'FirstName'));
            OrderBys.add(new RH_Utility.PickOption(label.rh_Group, 'RH_WorkGroup__c'));
            // OrderBys.add(new RH_Utility.PickOption('Created Date', 'CreatedDate'));
            // List<RH_WorkGroup__c> grps=workGroupQry.getActiveWorkgroups();
            mapReturn.put('OrderBys',OrderBys); 
            mapReturn.put('Picklists',RH_Utility.getPickListOptions(new List<String> {'RH_Role__c','RH_Status__c'},'Contact')); 
            mapReturn.putAll(RH_Utility.checkRole()); 
            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    }
    @AuraEnabled 
    public static Map<String,Object>  InitUserCreation(){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            List<RH_WorkGroup__c> grps=workGroupQry.getActiveWorkgroups();
            mapReturn.put('Groups',grps); 
            mapReturn.put('Picklists',RH_Utility.getPickListOptions(new List<String> {'RH_Role__c'},'Contact')); 

            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    }
    @AuraEnabled 
    public static Map<String,Object>  userCreation(String contactJson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        newContactWrapper mapInputs = new newContactWrapper();
        List<String> listcontactId = new List<String>();
        mapReturn.put('error',false);
        try {
             mapInputs = (newContactWrapper) JSON.deserialize(contactJson, newContactWrapper.class);
            //mapInputs = (Map<String, Object>) JSON.deserializeUntyped(contactJson);

            Boolean isInsert= String.isBlank(mapInputs.Id);
            Contact conctactUser=new Contact();
            conctactUser.LastName= mapInputs.LastName;
            conctactUser.FirstName= mapInputs.FirstName;
            conctactUser.Email= mapInputs.Email;
            conctactUser.Languages__c=mapInputs.Language;
            conctactUser.RH_Role__c= mapInputs.Role;
            conctactUser.RH_Started_Date__c = mapInputs.startDate;
            String grp=mapInputs.wGroup;
            if (String.isNotBlank(grp)) {
                conctactUser.RH_WorkGroup__c=  grp;
            }
            if(mapInputs.Activated != null){
                conctactUser.RH_Create_User__c=mapInputs.Activated;
                if(mapInputs.Activated){
                    conctactUser.RH_Status__c=RH_Constans.ACTIVATED_CONTACT_STATUS;
                }
            }
            List<User> users=userQry.getUserById(Userinfo.getUserId());
            if (!users.isEmpty()) {
                List<Contact> userContacts=contactQry.getContactById(users[0].RH_ContactId__c);
                if (!userContacts.isEmpty()) {
                    conctactUser.AccountId=userContacts[0].AccountId;
                }else{
                    mapReturn.put('ERRORcontact', 'Missing Contact');
                }
            }else{
                mapReturn.put('ERRORuser', 'Missing User');
            }
           
            conctactUser.recordTypeId=RH_Constans.RH_CONTACT_RT;
            if(isInsert){
                insert conctactUser;
            }else{
                conctactUser.Id=mapInputs.Id;
                update conctactUser;
            }
            //conctactUser.Account= String.valueOf(mapInputs.get('Account'));
            mapReturn.put('Input',contactJson); 
            mapReturn.put('conctactUser',conctactUser); 

            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
            mapReturn.put('es',e.getStackTraceString());
        }  
        return mapReturn;
    }
    
    @AuraEnabled 
    public static Map<String,Object>  userStatusUpdate(String contactJson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        Map<String, Object> mapInputs = new Map<String, Object>();
        mapReturn.put('error',false);
        System.Savepoint savepoint = null;
        try {
            savepoint = Database.setSavepoint();
            mapInputs = (Map<String, Object>) JSON.deserializeUntyped(contactJson);


            Contact conctactUser=new Contact();
            conctactUser.Id= String.valueOf(mapInputs.get('Id'));
            conctactUser.RH_Status__c= String.valueOf(mapInputs.get('Status'));
            if(conctactUser.RH_Status__c== new RH_Constans().LWC_ACTIVE_CONTACT_STATUS){
                conctactUser.RH_Create_User__c=true;
                //mapReturn.put('RH_Create_User__c', true); //mock
                activeUser(conctactUser.Id);
            }
            if (conctactUser.RH_Status__c == new RH_Constans().LWC_DISABLE_CONTACT_STATUS) {
                disableUser(conctactUser.Id);
            }
            update conctactUser;
            mapReturn.put('Input',contactJson); 
            mapReturn.put('conctactUser',conctactUser); 

            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            if (savepoint!= null) {
                Database.rollback(savepoint);
            }
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
            mapReturn.put('es',e.getStackTraceString());
        }  
        return mapReturn;
    }
    @future
    public static void disableUser(String conId) {
        List<User> users = userQry.getUserByContactId(conId);
        if (!users.isEmpty()){
            update new user (isActive=false,Id=users[0].Id);
        }
    }
    @future
    public static void activeUser(String conId) {
        List<User> users = userQry.getUserInfoByContactId(conId);
        if (!users.isEmpty()){
            update new user (isActive=true,Id=users[0].Id);
        }
    }
    @AuraEnabled 
    public static Map<String,Object>  userRoleUpdate(String contactJson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        Map<String, Object> mapInputs = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            mapInputs = (Map<String, Object>) JSON.deserializeUntyped(contactJson);


            Contact conctactUser=new Contact();
            conctactUser.Id= String.valueOf(mapInputs.get('Id'));
            conctactUser.RH_Role__c= String.valueOf(mapInputs.get('Role'));
            update conctactUser;
            //TO DO UPDATE USER ROLE
            
            //conctactUser.Account= String.valueOf(mapInputs.get('Account'));
            mapReturn.put('Input',contactJson); 
            mapReturn.put('conctactUser',conctactUser); 

            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    }
    private static List<Map<String, Object>> populateContact(List<Contact> conlist){
        List<Map<String, Object>> listcon = new List<Map<String, Object>>();
        string is;
        for(Contact con : conlist){
            if (! myconId.equalsIgnoreCase(con.Id)) {
                Map<String, Object> mapObj = new Map<String, Object>();
                string userId= (String.isNotBlank(con.RH_User__c)? con.RH_User__c : mapContactToUser.get(con.Id));
                mapObj.put('id', con.Id);
                mapObj.put('RHUser', con.RH_User__c);
                mapObj.put('Email', con.Email);
                mapObj.put('RHRolec', con.RH_Role__c);
                mapObj.put('RoleLabel', con.get('RoleLabel'));
                mapObj.put('accountName', con.Account.Name);
                mapObj.put('FirstName', con.FirstName);
                mapObj.put('Status', String.isBlank(con.RH_Status__c)?'':con.RH_Status__c.toLowerCase() );
                mapObj.put('statusLabel', con.get('statusLabel') );
                mapObj.put('LastName', con.LastName);
                mapObj.put('UserId', userId);
                listcon.add(mapObj);  
            }
            
        }
        return listcon;
    }
    @AuraEnabled
    public static Map<String,Object> changeUserPassword(String changepasswordjson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            mapReturn.put('input',changepasswordjson);
            changepasswordwrapper pwdResetter = (changepasswordwrapper) JSON.deserialize(changepasswordjson, changepasswordwrapper.class);
            //Uncomment Later
            /*List<User> users=userQry.getUserByContactId(pwdResetter.recordId);
            if (users.isEmpty()){
                throw new RH_ControllerException('004','Invalid User');
            }
            
            pwdResetter.recordId=users[0].id;*/
            Map<String, Object> mapRole = RH_Utility.checkRole();
            if ((Boolean) mapRole.get('isCEO') || (Boolean) mapRole.get('isRHUser')) {
                pwdResetter.changePassword();
            }else {
                throw new RH_ControllerException('002','Unsufficient rights for this action');
            }
                
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

    @AuraEnabled 
    public static Map<String, Object> getEmployeeDetails(String recordId){
        
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        Schema.SObjectType USER_OBJECT = Schema.User.getSObjectType();
        mapReturn.put('isUser',false);
        try {
            Id recID=recordId;
            String ContactId=recordId;
            if(USER_OBJECT==recID.getSObjectType() ){
                // List<User> users=userQry.getUserById(recordId);
                List<User> users=userQry.getUserInfoById(recordId,null);
                if (users.isEmpty()) throw new RH_ControllerException('001','Missing User');
                User u=users[0];
                ContactId=u.RH_ContactId__c;
                mapReturn.put('isUser',true);
            }
            
            if (String.isBlank(ContactId)) {
                throw new RH_ControllerException('002','This user is not a link to any RH Contact');
            }
            mapReturn.put('input',recordId);
            List<Contact> conlist = contactQry.getContactById(ContactId);
            if (conlist.isEmpty()){
                throw new RH_ControllerException('004','User Not Found');
            }
            mapReturn.put('Employe',conlist[0]); 
            mapReturn.put('Constants',RH_Constans.getAllConstants()); 
            mapReturn.putAll(RH_Utility.checkRole()); 


            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }
        return mapReturn;
    }

    @AuraEnabled 
    public static String getExtraFields(String recordId){
       List<Contact>  extrafield = contactQry.getExtrafied(recordId);
       if(extrafield.size()>0){
        return extrafield[0].RH_Extra_Infos__c;
       }
       return null;
    }
    
    public class ContactFilterWrapper {
        @AuraEnabled public String searchText{get;set;}
        @AuraEnabled public String status{get;set;}
        @AuraEnabled public Datetime startDate{get;set;}
        @AuraEnabled public Datetime endDate{get;set;}
        @AuraEnabled public String role{get;set;}
        @AuraEnabled public Boolean isActive{get;set;}
        @AuraEnabled public String orderBy{get;set;}
        @AuraEnabled public String orderOn{get;set;}
    } 
    public class ContactWrapper {
        @AuraEnabled public String LastName{get;set;}
        @AuraEnabled public String RHRolec{get;set;}
        @AuraEnabled public String FirstName{get;set;}
        @AuraEnabled public String RHUser{get;set;}
        @AuraEnabled public String accountName{get;set;}
        @AuraEnabled public String id {get;set;}
    }
    public class newContactWrapper {
        @AuraEnabled public String Id{get;set;}
        @AuraEnabled public String LastName{get;set;}
        @AuraEnabled public String FirstName{get;set;}
        @AuraEnabled public String Language{get;set;}
        @AuraEnabled public String Email{get;set;}
        @AuraEnabled public String Role{get;set;}
        @AuraEnabled public String wGroup{get;set;}
        @AuraEnabled public Boolean Activated{get;set;}
        @AuraEnabled public Date  startDate{get;set;}
        
    }
    public class changepasswordwrapper  {
        @AuraEnabled public String newPassword;
        @AuraEnabled public String recordId;
        public void changePassword() {
            Blob b = Crypto.GenerateAESKey(128);
            String h = EncodingUtil.ConvertTohex(b);
            newPassword=h;//'nl!'+recordId.abbreviate(5)+system.now().getTime();//auto generate default pass
            System.setPassword(recordId, newPassword);
            Map<String, Object> emailInputMap = new  Map<String, Object>{
                'userId'=> recordId,
                'Password'=> newPassword
            };
            RH_Emails_Utility.sendUserResetPassword(emailInputMap);
        }
    }

}