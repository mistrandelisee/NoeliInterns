public without sharing class rh_mainController {
    private static RH_User_Query userQry = RH_User_Query.getInstance();
    @AuraEnabled
    public static Map<String,Object> getUserInfo() {
        Map<String, Object> mapReturn = new Map<String, Object>();
        try {
            List<User> users=userQry.getUserById(Userinfo.getUserId());
            if (users.isEmpty()) throw new RH_ControllerException('001','Missing User');
            mapReturn.put('user', users[0]);
        } catch (Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }

        return mapReturn;
    }
    @AuraEnabled
    public static Map<String,Object> getRecordPage(String recordId) {
        Map<String, Object> mapReturn = new Map<String, Object>();
        Schema.SObjectType USER_OBJECT = Schema.User.getSObjectType();
        Schema.SObjectType TIMESHEET_OBJECT = Schema.Timesheet.getSObjectType();
        Schema.SObjectType EVENT_OBJECT = Schema.Event__c.getSObjectType();
        Schema.SObjectType REQUEST_OBJECT = Schema.RH_Request__c.getSObjectType();
        Schema.SObjectType ACCOMPLISHMENT_OBJECT = Schema.RH_Accomplishment__c.getSObjectType();
        Schema.SObjectType INVOICE_OBJECT = Schema.RH_Invoice__c.getSObjectType();
        mapReturn.put('error',false);
        try {
            Id recID=recordId;
            if(USER_OBJECT==recID.getSObjectType() ){
                mapReturn.put('page', '/rhusers');
            }else if(TIMESHEET_OBJECT==recID.getSObjectType() ){
                mapReturn.put('page', '/rhtimesheet');
            }else if(EVENT_OBJECT==recID.getSObjectType() ){
                mapReturn.put('page', '/Event');
            }else if(REQUEST_OBJECT==recID.getSObjectType() ){
                mapReturn.put('page', '/request-management');
            }else if(ACCOMPLISHMENT_OBJECT==recID.getSObjectType() ){
                mapReturn.put('page', '/accomplishment');
            }else if(INVOICE_OBJECT==recID.getSObjectType() ){
                mapReturn.put('page', '/rh-invoices');
            }

            else{
                mapReturn.put('page', '/');
            }

        } catch (Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }

        return mapReturn;
    }
}