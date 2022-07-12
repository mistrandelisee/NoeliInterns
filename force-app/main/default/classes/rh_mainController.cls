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
        mapReturn.put('error',false);
        try {
            Id recID=recordId;
            if(USER_OBJECT==recID.getSObjectType() ){
                mapReturn.put('page', '/rhusers');
            }else if(TIMESHEET_OBJECT==recID.getSObjectType() ){
                mapReturn.put('page', '/rhtimesheet');
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