public without sharing class RH_Users_controller {
    private static RH_User_Query userQry = RH_User_Query.getInstance();
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();

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

    @AuraEnabled 
    public static Contact displayContactInfo(String recordId){
        List<Contact> conlist = contactQry.getContactById(recordId);
        if(conlist.size()>0){
            return conlist[0];
        }
        return null;
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

}