global without sharing class RH_LoginFlowController {
    private static RH_User_Query userQry = RH_User_Query.getInstance();
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();
    @InvocableMethod(label='Update Related Contact')
    public static List<VisitorUrlOutput> getUrlName(List<VisitorInput> VisitorInputs) {
        String userId=VisitorInputs[0].userId;
        Map<string,object> mapReturn =getContact(userId);
        Boolean esito =(Boolean) mapReturn.get('error');
        return new List<VisitorUrlOutput>{
            new VisitorUrlOutput('','',esito)
        };
    }
    /*public class UrlInput {
        @InvocableVariable(required=true)
        public ID userId;
    }*/
      @AuraEnabled
      public static Map<string,object> getContact(ID userId) {
        Map<string,object> mapReturn = new Map<String, Object>();
        mapReturn.put('error', false);
        try {
            List<User> users=userQry.getUserById(userId);
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
            update new contact(Id=userContact.Id,RH_User__c=u.Id);
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
    public class VisitorUrlOutput {
    @InvocableVariable(required=true)
    public String fullUrl;
    @InvocableVariable(required=true)
    public String variants;
    @InvocableVariable(required=true)
    public boolean error;
        public VisitorUrlOutput(String url,String startUrl,boolean err) {
            fullUrl=url;
            variants=startUrl;
            error=err;
        }
    }
    public class VisitorInput {
        @InvocableVariable(required=true)
        public String userId;
    }  
}