public without sharing class RH_Users_controller {
    private static RH_User_Query userQry = RH_User_Query.getInstance();
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();
    private static RH_WorkGroup_Query workGroupQry = RH_WorkGroup_Query.getInstance();
    
    public static Map<String, String> mapContactToUser = new Map<String, String>();
    static string myconId='';
    @AuraEnabled 
    public static Map<String,Object>  checkUserCreation(String conID){
        Map<String, Object> mapReturn = new Map<String, Object>();
        
        List<String> listcontactId = new List<String>();
        mapReturn.put('error',false);
        try {
            List<User> users = userQry.getUserByContactId(conID);
            mapReturn.put('Ok', !users.isEmpty());
            mapReturn.put('users', users);
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    
    
    }

    @AuraEnabled 
    public static Map<String,Object>  getContacts(){
        Map<String, Object> mapReturn = new Map<String, Object>();
        List<Map<String, Object>> listcon = new List<Map<String, Object>>();
        List<String> listcontactId = new List<String>();
        mapReturn.put('error',false);
        try {
            
                
            Map<Id, Contact> mapContacts=contactQry.getAllContacts();
            
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
                        listcontactId.add(conId);
                    }
                }
            }else{
                throw new RH_ControllerException('004','No User for This Profile Founded');
            }
                if (mapContacts.values().size()>0){
                    listcon = populateContact(mapContacts.values());
                }else{
                    throw new RH_ControllerException('002','No RH Contact Founded');
                } 
            mapReturn.put('Employes',listcon); 
            // mapReturn.put('users',users); 
            mapReturn.put('Constants',RH_Constans.getAllConstants()); 
            mapReturn.put('Timesheets',[select Id,TotalDurationInHours, EndDate, StartDate, (SELECT Id,Status, Description from TimeSheetEntries) from TimeSheet]); 

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
            conctactUser.RH_Role__c= mapInputs.Role;
            conctactUser.RH_Started_Date__c = mapInputs.startDate;
            String grp=mapInputs.wGroup;
            if (String.isNotBlank(grp)) {
                conctactUser.RH_WorkGroup__c=  grp;
            }
            conctactUser.RH_Create_User__c=false;
            if(mapInputs.Activated){
                conctactUser.RH_Create_User__c=true;
                conctactUser.RH_Status__c=RH_Constans.ACTIVATED_CONTACT_STATUS;
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
                mapObj.put('id', con.Id);
                mapObj.put('RHUser', con.RH_User__c);
                mapObj.put('RHRolec', con.RH_Role__c);
                mapObj.put('accountName', con.Account.Name);
                mapObj.put('FirstName', con.FirstName);
                mapObj.put('Status', String.isBlank(con.RH_Status__c)?'':con.RH_Status__c.toLowerCase() );
                mapObj.put('LastName', con.LastName);
                mapObj.put('UserId', mapContactToUser.get(con.Id));
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
            List<User> users=userQry.getUserByContactId(pwdResetter.recordId);
            if (users.isEmpty()){
                throw new RH_ControllerException('004','Invalid User');
            }
            pwdResetter.recordId=users[0].id;
            pwdResetter.changePassword();
                
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
                List<User> users=userQry.getUserById(recordId);
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
           System.setPassword(recordId, newPassword);
        }
    }

}