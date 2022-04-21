public with sharing class RH_Request_controller {
    
    @AuraEnabled(cacheable=true)
    public static List<RH_Request__c> getrequest() {
        return [SELECT id,RH_Description__c,Rh_Status__c,RH_Addressed_To__r.Name,CreatedDate,RH_RequestTypeName__c FROM RH_Request__c WHERE RH_Description__c != NULL];
    }
    @AuraEnabled(cacheable=true)
    public static List<Contact> getAdressedTo() {
        return [SELECT id, Name FROM Contact];
    }

    @AuraEnabled
    public static RH_Request__c retreiveRequest(String requestId){
        return [SELECT id, RH_Description__c , RH_Addressed_To__r.Name, Rh_Status__c, RH_Start_date__c, 
        RH_End_date__c, RH_Parent_request_id__c, RH_Addressed_Cc__c, RH_Complain_On__c,RecordType.Name  FROM RH_Request__c WHERE id =: requestId ];
    }

    @AuraEnabled
    public static List<RecordType> getRecordType(){
        // Map<String,String> RecordT = new Map<String,String>();
        // for (RecordType var : [select Id,Name from RecordType where sObjectType='RH_Request__c']) {
        //     RecordT.put(var.Name, var.Id);
        // }
        return [select Id,Name from RecordType where sObjectType='RH_Request__c'];
    }


    @AuraEnabled
    public static Map<String,Object> newRequest(String Requestjson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            mapReturn.put('input',Requestjson);  
            Requestdetailswrapper Requestinfo = (Requestdetailswrapper) JSON.deserialize(Requestjson, Requestdetailswrapper.class);
            RH_Request__c RequestUser =Requestinfo.getRequest();
            RequestUser.RH_Status__c = RH_Constans.RH_OPEN;
            // RequestUser.RH_RequestTypeName__c = Schema.getGlobalDescribe().get('RH_Request__c').getDescribe().getRecordTypeInfosById().get(RequestUser.RecordT).getName();
            // RequestUser.recordTypeId=RH_Constans.RH_CONTACT_RT;
            // mapReturn.put('conctactUser',conctactUser);
            insert RequestUser;
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }
       
        return mapReturn;
    }


    public class Requestdetailswrapper  {
        @AuraEnabled public String ComplainOn;
        @AuraEnabled public String RecordT;
        @AuraEnabled public Datetime RH_StartDate;
        @AuraEnabled public Datetime RH_EndDate;
        @AuraEnabled public String RH_AddressedTo;
        @AuraEnabled public string RH_AddressedCc;
        @AuraEnabled public string RH_Description;
        public RH_Request__c getRequest() {
            return new RH_Request__c(
                RH_Complain_On__c=this.ComplainOn, 
                RecordTypeId=this.RecordT, 
                RH_Start_date__c=this.RH_StartDate, 
                RH_End_date__c=this.RH_EndDate,
                RH_Addressed_To__c=this.RH_AddressedTo,
                RH_Addressed_Cc__c=this.RH_AddressedCc,
                RH_Description__c=this.RH_Description);
        }
    }

}