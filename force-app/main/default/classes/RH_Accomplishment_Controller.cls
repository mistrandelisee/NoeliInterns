public without sharing class RH_Accomplishment_Controller {
    
    private static RH_Accomplishment_Query accomQry = RH_Accomplishment_Query.getInstance();
    private static RH_User_Query userQry = RH_User_Query.getInstance();

    /*@@@@@ Kbrel Add*/ 
    @AuraEnabled
    public static List<RH_Accomplishment__c> getMyAccomplishment(Integer edLimit){
        /*User u = userQry.getUserInfoId();
        String conId = u.RH_ContactId__c;*/
        return accomQry.getMyAccomplishment(edLimit);
    }
    /** end **/
    
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
    public static Map<String,Object> addAccomplishment(String accomJson, String status, String idAcc){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            mapReturn.put('input',accomJson);  
            Accomplishmentdetailswrapper accomInfo = (Accomplishmentdetailswrapper) JSON.deserialize(accomJson, Accomplishmentdetailswrapper.class);
            RH_Accomplishment__c accomplish =accomInfo.accomplishmentTake();
            List<User> currentU = userQry.getUserById(UserInfo.getUserId());
            if (String.isNotBlank(idAcc)) {
                accomplish.Id = idAcc;
                update accomplish; 
            }else {
                if (currentU.size() > 0) {
                    accomplish.RH_Status__c = status;
                    accomplish.RH_Submiter__c = currentU[0].RH_ContactId__c;
                    insert accomplish;   
                }else{
                    throw new RH_ControllerException('002','No RH Contact Founded');
                }
            }
            mapReturn.put('myRecord',accomplish);
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }
       
        return mapReturn;
    }

    @AuraEnabled
    public static void activateAccomplishment(String accomId, String status){
        try{
            RH_Accomplishment__c accomplish = new RH_Accomplishment__c(Id = accomId, RH_Status__c = status);
            update accomplish;
        }catch(Exception e) {
            throw new AuraHandledException('Error was occured');
        }  
    }

    @AuraEnabled
    public static void deleteAccomplishment(String accId){
        try{
            delete [SELECT Id FROM RH_Accomplishment__c WHERE Id = :accId];
        }catch(Exception e) {
            throw new AuraHandledException('Error was occured');
        }
        
    }

    @AuraEnabled
    public static List<RH_Accomplishment__c> filterAccomplishment(String title, String description, String status){
        return accomQry.filterAccomplishment(title, description, status);
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