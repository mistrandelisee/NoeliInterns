public without sharing class RH_Accomplishment_Query {

    /** The class instance */
    private static RH_Accomplishment_Query instance = null;

    /**
     * @description @return the class instance
     */
    public static RH_Accomplishment_Query getInstance() {

        if(instance == null) {

            instance = new RH_Accomplishment_Query();
        }
        return instance;
    }

	public List<RH_Accomplishment__c> getAccomplishmentList() {
        return [SELECT Id, Name, RH_Description__c, Rh_Status__c, RH_Date__c, RH_Submiter__r.Name, RH_Title__c, RH_Visibility__c FROM RH_Accomplishment__c];
    }

    public RH_Accomplishment__c getAccomplishmentById(String recordId) {
        return [SELECT Id, Name, RH_Description__c, Rh_Status__c, RH_Date__c, RH_Submiter__c, RH_Submiter__r.Name, RH_Title__c, RH_Visibility__c FROM RH_Accomplishment__c WHERE Id = :recordId LIMIT 1];
    }
}