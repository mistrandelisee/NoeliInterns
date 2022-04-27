public without sharing class RH_Users_controller {
    private static RH_User_Query userQry = RH_User_Query.getInstance();
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();
    private static RH_WorkGroup_Query workGroupQry = RH_WorkGroup_Query.getInstance();
    


    @AuraEnabled 
    public static Map<String,Object>  getContacts(){
        Map<String, Object> mapReturn = new Map<String, Object>();
        List<Map<String, Object>> listcon = new List<Map<String, Object>>();
        List<String> listcontactId = new List<String>();
        mapReturn.put('error',false);
        try {
            List<User> users=userQry.getOtherUsers();
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
            mapReturn.put('Employes',listcon); 
            // mapReturn.put('users',users); 
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
    public static Map<String,Object>  InitUserCreation(){
        Map<String, Object> mapReturn = new Map<String, Object>();
        List<ContactWrapper> listcon = new List<ContactWrapper>();
        List<String> listcontactId = new List<String>();
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
        Map<String, Object> mapInputs = new Map<String, Object>();
        List<ContactWrapper> listcon = new List<ContactWrapper>();
        List<String> listcontactId = new List<String>();
        mapReturn.put('error',false);
        try {
            mapInputs = (Map<String, Object>) JSON.deserializeUntyped(contactJson);


            Contact conctactUser=new Contact();
            conctactUser.LastName= String.valueOf(mapInputs.get('LastName'));
            conctactUser.FirstName= String.valueOf(mapInputs.get('FirstName'));
            conctactUser.Email= String.valueOf(mapInputs.get('Email'));
            conctactUser.RH_Role__c= String.valueOf(mapInputs.get('Role'));
            String grp=String.valueOf(mapInputs.get('Group'));
            if (String.isNotBlank(grp)) {
                conctactUser.RH_WorkGroup__c=  grp;
            }
            if((Boolean)mapInputs.get('Activated')){
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
    
    @AuraEnabled 
    public static Map<String,Object>  userStatusUpdate(String contactJson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        Map<String, Object> mapInputs = new Map<String, Object>();
        List<ContactWrapper> listcon = new List<ContactWrapper>();
        List<String> listcontactId = new List<String>();
        mapReturn.put('error',false);
        try {
            mapInputs = (Map<String, Object>) JSON.deserializeUntyped(contactJson);


            Contact conctactUser=new Contact();
            conctactUser.Id= String.valueOf(mapInputs.get('Id'));
            conctactUser.RH_Status__c= String.valueOf(mapInputs.get('Status'));
            if(conctactUser.RH_Status__c== new RH_Constans().LWC_ACTIVE_CONTACT_STATUS){
                //conctactUser.RH_Create_User__c=true;
                mapReturn.put('RH_Create_User__c', true); //mock
            }
            update conctactUser;
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
    @AuraEnabled 
    public static Map<String,Object>  userRoleUpdate(String contactJson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        Map<String, Object> mapInputs = new Map<String, Object>();
        List<ContactWrapper> listcon = new List<ContactWrapper>();
        List<String> listcontactId = new List<String>();
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
            Map<String, Object> mapObj = new Map<String, Object>();
            mapObj.put('id', con.Id);
            mapObj.put('RHUser', con.RH_User__c);
            mapObj.put('RHRolec', con.RH_Role__c);
            mapObj.put('accountName', con.Account.Name);
            mapObj.put('FirstName', con.FirstName);
            mapObj.put('Status', String.isBlank(con.RH_Status__c)?'':con.RH_Status__c.toLowerCase() );
            mapObj.put('LastName', con.LastName);
            listcon.add(mapObj);
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
        try {
            mapReturn.put('input',recordId);
            List<Contact> conlist = contactQry.getContactById(recordId);
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
    public class changepasswordwrapper  {
        @AuraEnabled public String newPassword;
        @AuraEnabled public String recordId;
        public void changePassword() {
           System.setPassword(recordId, newPassword);
        }
    }

}