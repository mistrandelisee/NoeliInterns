public with sharing class RH_Project_Query {
    /** The class instance */
    private static RH_Project_Query instance = null;

     /**
     * @description @return the class instance
     */
    public static RH_Project_Query getInstance() {

        if(instance == null) {

            instance = new RH_Project_Query();
        }
        return instance;
    }

    public List<Project__c> getProject(){
        return [SELECT id, Name, Description__c,End_Date__c,Link__c,Status__c,Start_Date__c,Project_Manager__r.Name,Project_Manager__c FROM Project__c ];
    }

    public List<Project__c> getProjectById(String IdProject){
        return [SELECT id, Name, Description__c,End_Date__c,Link__c,Status__c,Start_Date__c,Project_Manager__r.Name,Project_Manager__c FROM Project__c WHERE Id =:IdProject];
    }

    public List<RH_Participation__c> getMembers(String IdProject){
        return [SELECT id, RH_Contact__r.Name,RH_Contact__r.Email FROM RH_Participation__c WHERE RH_Project__c = :IdProject];
    }

    public List<RH_Participation__c> getParticipate(List<String> contactId){
        return [SELECT id, RH_Contact__c,RH_Project__c FROM RH_Participation__c WHERE RH_Contact__c IN :contactId];
    }

    public List<Contact> getNotMembers(String IdProject,String Idmanager){
        List<RH_Participation__c> ldt= [SELECT id, RH_Contact__c FROM RH_Participation__c WHERE RH_Project__c = :IdProject or RH_Contact__c = :Idmanager];
        // List<RH_Participation__c> ldt= getMembers(IdProject);
        List<String> lstr = new List<String>();
        for (RH_Participation__c vare : ldt) {
            lstr.add(vare.RH_Contact__c);
        }
        return [SELECT id, Name,Email FROM Contact WHERE Id NOT IN :lstr AND recordTypeId=:RH_Constans.RH_CONTACT_RT];
    }
}