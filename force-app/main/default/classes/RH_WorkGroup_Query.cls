public with sharing class RH_WorkGroup_Query {
    
    /** The class instance */
    private static RH_WorkGroup_Query instance = null;

    /**
     * @description @return the class instance
     */
    public static RH_WorkGroup_Query getInstance() {

        if(instance == null) {

            instance = new RH_WorkGroup_Query();
        }
        return instance;
    }

    public  List<RH_WorkGroup__c> getActiveWorkgroups() {
        return [SELECT Id,RH_Status__c, Name, RH_Description__c,  RH_Team_Leader__r.Name FROM RH_WorkGroup__c WHERE RH_Status__c =:RH_Constans.ACTIVATED_WORKGROUP_STATUS];
    }
}
