public without sharing class RH_Utility {
    @AuraEnabled(cacheable=true)
    public static Map<String,Object> getpickListValue() {

         return getPickListOptions(
            new List<String> {
                'RH_Role__c'},
            'Contact');
    }


    public static Map<String, Object> getPickListOptions(List<String> fieldNameList, String objectName) {

        Map<String, Object> returnMap = new Map<String, Object>();
        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();

        for (String fieldName : fieldNameList) {

            List<PickOption> pickOptions = new List<PickOption>();
            Map<String, Object> fieldValueMap = new Map<String, Object>();
            for (Schema.PicklistEntry sple : fieldMap.get(fieldName).getDescribe().getPicklistValues()) {
                if (sple.isActive()) {
                    PickOption p = new PickOption(sple.getLabel(), sple.getValue());
                    fieldValueMap.put(sple.getLabel(), sple.getValue());
                    pickOptions.add(p);
                }
            }

            returnMap.put(fieldName, pickOptions);
            String extraKey='Map'+fieldName;
            returnMap.put(extraKey, fieldValueMap);
        }

        return returnMap;
    }

    public class PickOption {

        @AuraEnabled
        public String label;
        @AuraEnabled
        public String value;

        public PickOption(String label, String value) {

            this.label = label;
            this.value = value;
        }
    }
    private static RH_User_Query userQry = RH_User_Query.getInstance();
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();

    @AuraEnabled
    public static Map<string,object> checkRole() {
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
            String Role=userContact.RH_Role__c;
            mapReturn.put('currentContact', userContact);
            mapReturn.put('isCEO', RH_Constans.CONTACT_ROLE_CEO.equalsIgnoreCase(Role));
            mapReturn.put('isBaseUser', RH_Constans.CONTACT_ROLE_BU.equalsIgnoreCase(Role));
            mapReturn.put('isRHUser', RH_Constans.CONTACT_ROLE_TL.equalsIgnoreCase(Role));
            mapReturn.put('isTLeader', RH_Constans.CONTACT_ROLE_RH.equalsIgnoreCase(Role));
            }
        catch(RH_ControllerException ce) {
            System.debug('@@@@@@@@@@@@@RH_Utility::checkRole:: RH_ControllerException>> '+ce.getMessage());
            mapReturn.put('error', true);
            mapReturn.put('code', ce.getCode());
            mapReturn.put('msg',ce.getMessage());
        }
        catch(Exception e) {
            System.debug('@@@@@@@@@@@@@RH_Utility::checkRole:: Exception>> '+e.getMessage());
            mapReturn.put('error', true);
            mapReturn.put('msg',e.getMessage());
        }
        System.debug('log ' + mapReturn);
        
        return mapReturn;
    }
}