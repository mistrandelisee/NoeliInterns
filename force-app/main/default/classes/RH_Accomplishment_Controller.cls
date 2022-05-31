public without sharing class RH_Accomplishment_Controller {
    
    private static RH_Accomplishment_Query accomQry = RH_Accomplishment_Query.getInstance();
    private static RH_User_Query userQry = RH_User_Query.getInstance();

    @AuraEnabled
    public static List<RH_Accomplishment__c> getAccomplishment(){
        return accomQry.getAccomplishmentList();
    }

    @AuraEnabled
    public static RH_Accomplishment__c accomplishmentDetail(String idAccom){
        return accomQry.getAccomplishmentById(idAccom);
    }

    @AuraEnabled
    public static Boolean checkCurrentContact(String idAcc){
        RH_Accomplishment__c accom =  accomQry.getAccomplishmentById(idAcc);
        List<User> currentU = userQry.getUserById(UserInfo.getUserId());
        if (currentU.size() > 0){
            if(accom.RH_Submiter__c == currentU[0].RH_ContactId__c){
                return true;
            }else{
                return false;
            }  
        }else{
            return false;
        }
    }

    @AuraEnabled
    public static Map<String,Object> addAccomplishment(String accomJson, String status){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            mapReturn.put('input',accomJson);  
            Accomplishmentdetailswrapper accomInfo = (Accomplishmentdetailswrapper) JSON.deserialize(accomJson, Accomplishmentdetailswrapper.class);
            RH_Accomplishment__c accomplish =accomInfo.accomplishmentTake();
            accomplish.RH_Status__c = status;
            List<User> currentU = userQry.getUserById(UserInfo.getUserId());
            if (currentU.size() > 0) {
                accomplish.RH_Submiter__c = currentU[0].RH_ContactId__c;
                insert accomplish;   
            }else{
                throw new RH_ControllerException('002','No RH Contact Founded');
            }
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }
       
        return mapReturn;
    }

    public class Accomplishmentdetailswrapper {
        @AuraEnabled public String description;
        @AuraEnabled public String title;
        @AuraEnabled public Boolean visibility;
        @AuraEnabled public Date myDate;
        public RH_Accomplishment__c accomplishmentTake() {
            return new RH_Accomplishment__c(
                RH_Description__c=this.description, 
                RH_Title__c = this.title,
                RH_Visibility__c=this.visibility,
                RH_Date__c=this.myDate
            );
        }
    }
}