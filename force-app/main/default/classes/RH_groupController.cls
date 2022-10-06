public without sharing class RH_groupController {
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();
    

    @AuraEnabled
    public static List<contact> getContactLeader() {
        return contactQry.getEligibleTeamLeaders();

    }

    @AuraEnabled
    public static RH_WorkGroup__c createGroupe(String name, String description, String Leader, String id, String statut){
        RH_WorkGroup__c groupe =  new RH_WorkGroup__c(Id=id, RH_Description__c=description, RH_Team_Leader__c=Leader, Name=name, RH_Status__c=statut); 
        upsert groupe;
        return groupe;  
    }

    @AuraEnabled
    public static Map<String, Object>  getListeGroupe(){
        Map<String, Object> mapListeGroupe = new Map<String, Object>();
        List<RH_WorkGroup__c> liste = [SELECT Name, RH_Team_Leader__c,RH_Status__c, RH_Description__c, RH_Team_Leader__r.Name FROM RH_WorkGroup__c
                WHERE RH_Status__c != 'Desactived'];
        mapListeGroupe.put('listeGroupe', liste);
        return mapListeGroupe;
    }
    @AuraEnabled
    public static RH_WorkGroup__c getGroupe(String id) {
        RH_WorkGroup__c groupe = [SELECT Name, RH_Team_Leader__c, RH_Description__c, RH_Status__c, RH_Team_Leader__r.Name, RH_Team_Leader__r.RH_user__c, (select id, name, Email, Phone, RH_WorkGroup__c, RH_User__c  FROM RH_GroupMembers__r)
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
    @AuraEnabled
    public static List<Contact> addGroupMember(List<String> liste, String id){
        List<Contact> lst = new List<Contact>() ;
        for(String item : liste){
            Contact con = new Contact(Id=item, RH_WorkGroup__c=id);
            lst.add(con);
        }
        update lst;
        return lst;
    }
    @AuraEnabled
    public static RH_WorkGroup__c getGroupeId(String idTeamLeader){
        RH_WorkGroup__c groupe = new RH_WorkGroup__c();
        try {
            groupe = RH_WorkGroup_Query.getGroupId(idTeamLeader);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return groupe;
    }
    @AuraEnabled 
    public static Map<String, String> updateGroupStatut(String id, String statut){
        Map<String, String> groupeStatut = new Map<String, String>();
        try {
            RH_WorkGroup__c groupe = [SELECT Id, RH_Status__c FROM 
            RH_WorkGroup__c WHERE Id =:id];
            groupe.RH_Status__c = statut; 
            update groupe;

            groupeStatut.put('statut',statut);
        } catch(Exception e) {
            groupeStatut.put('error',e.getMessage());
            System.debug(e.getMessage());
        }
       return groupeStatut;    
    }
    @AuraEnabled
    public static Map<String, String> activeGroupe(string id){
        Map<String, String> mapActive = new Map<String, String>();
        try {
            RH_WorkGroup__c groupe = new RH_WorkGroup__c(Id=id, RH_Status__c='Activated');          
            update groupe; 
            mapActive.put('groupeId', groupe.Id);    
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapActive.put('error', e.getMessage());
        }
      return mapActive;  
    }
    @AuraEnabled
    public static Map<String, String> deleteGroupe(String id){
        Map<String, String> mapName = new Map<String, String>();
        try {
            delete [SELECT Id, Name FROM RH_WorkGroup__c WHERE Id =:id];
            mapName.put('result', 'delete Groupe with id:'+id+ ' successful');
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapName.put('error', e.getMessage());
        }
        return mapName;
    }

    @AuraEnabled
    public static Map<String, Object> updateGroupMember(List<String> listId, String id ){
        Map<String, Object> mapName = new Map<String, Object>();
        try {
            RH_WorkGroup__c groupe = getGroupe(id); 
            List<Contact> listName = groupe.RH_GroupMembers__r;
            for(Contact con : listName){
                con.RH_WorkGroup__c = null;  
            } 
            update listName;
            List<Contact> listeCon = addGroupMember(listId, id); 
            mapName.put('result', listName);
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapName.put('error', e.getMessage());
        }
               
            return mapName;
    }

    @AuraEnabled
    public static Map<String, Object> InitFilter(){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            mapReturn.put('Picklists',RH_Utility.getPickListOptions(new List<String> {'RH_Status__c'},'RH_WorkGroup__c')); 
            mapReturn.putAll(RH_Utility.checkRole()); 
            mapReturn.put('Ok',true);
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }
        return mapReturn;
    }

    public class GroupFilterWrapper {
        @AuraEnabled public String searchText{get;set;}
        @AuraEnabled public String status{get;set;}
        @AuraEnabled public String orderBy{get;set;}
        @AuraEnabled public String orderOn{get;set;}
    }

    @AuraEnabled
    public static Map<String,Object>  getFilteredGrp(String filterTxt){
        Map<String, Object> mapReturn = new Map<String, Object>();
        try {
            GroupFilterWrapper filter= (GroupFilterWrapper) JSON.deserialize(filterTxt, GroupFilterWrapper.class); 
            mapReturn=RH_WorkGroup_Query.getFilteredGroup(filter);
        } catch (Exception e) {
            mapReturn.put('error', e);
            throw new AuraHandledException(e.getMessage()+ e.getStackTraceString());

        }
        return mapReturn;
    }
}