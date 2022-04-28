public without sharing class RH_groupController {
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();
    

    @AuraEnabled
    public static List<contact> getContactLeader() {
        return contactQry.getEligibleTeamLeaders();

    }

    @AuraEnabled
    public static void createGroupe(String name, String description, String Leader){
        insert( new RH_WorkGroup__c(RH_Description__c=description, RH_Team_Leader__c=Leader, Name=name));   
    }

    @AuraEnabled
    public static Map<String, Object>  getListeGroupe(){
        Map<String, Object> mapListeGroupe = new Map<String, Object>();
        List<RH_WorkGroup__c> liste = [SELECT Name, RH_Team_Leader__c, RH_Description__c, RH_Team_Leader__r.Name FROM RH_WorkGroup__c];
        mapListeGroupe.put('listeGroupe', liste);
        return mapListeGroupe;
    }
    @AuraEnabled
    public static RH_WorkGroup__c getGroupe(String id) {
        RH_WorkGroup__c groupe = [SELECT Name, RH_Team_Leader__c, RH_Description__c, RH_Team_Leader__r.Name, (select id, name FROM RH_GroupMembers__r)
         FROM RH_WorkGroup__c WHERE Id =: id];
         return groupe;
    }
    @AuraEnabled
    public static Contact getLeader(String id){
        return [SELECT Name, Email, Level__c FROM Contact WHERE Id =: id ];
    }
    @AuraEnabled
    public static Map<String, Object> getContactForGroupe(){
        Map<String, Object> mapContactGroupe = new Map<String, Object>(); 
        List<Contact> liste = RH_Contact_Query.getContactForGroup();
        mapContactGroupe.put('listeContact',liste);
        return mapContactGroupe;
    }
}