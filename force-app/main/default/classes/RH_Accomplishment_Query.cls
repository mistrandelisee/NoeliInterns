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
        return [SELECT Id, Name, RH_Description__c, toLabel(Rh_Status__c) Rh_Status, Rh_Status__c, RH_Date__c, RH_Submiter__r.Name, RH_Title__c, RH_Visibility__c FROM RH_Accomplishment__c WHERE OwnerId =: UserInfo.getUserId() ORDER BY createddate DESC];
    }

    public RH_Accomplishment__c getAccomplishmentById(String recordId) {
        return [SELECT Id, Name, RH_Description__c, toLabel(Rh_Status__c) Rh_Status, Rh_Status__c, RH_Date__c, RH_Submiter__c, RH_Submiter__r.Name, RH_Title__c, RH_Visibility__c FROM RH_Accomplishment__c WHERE Id = :recordId LIMIT 1];
    }

    public  List<RH_Accomplishment__c> getMyAccomplishment(Integer endLimit) {
        return [SELECT Id, Name, OwnerId, RH_Description__c, Rh_Status__c, RH_Date__c, RH_Submiter__c, RH_Submiter__r.Name, RH_Title__c, RH_Visibility__c FROM RH_Accomplishment__c WHERE OwnerId =: UserInfo.getUserId() order by createddate desc LIMIT : endLimit];
    }

    public List<RH_Accomplishment__c> filterAccomplishment(String title, String status, String searchText){

        
        String query= 'SELECT Id, Name, RH_Description__c, toLabel(Rh_Status__c) Rh_Status, Rh_Status__c, RH_Date__c, RH_Submiter__r.Name, RH_Title__c, RH_Visibility__c FROM RH_Accomplishment__c ';
        Boolean check = false;
        String currentUser = UserInfo.getUserId();
        searchText = String.isNotBlank(searchText) ? searchText : '';
        title = String.isNotBlank(title) ? title : '';

        if(searchText != null){

            String text = '%'+searchText+'%';
            
            if(check){
                query+= ' AND (Name LIKE: text OR Rh_Status__c LIKE: text ) ';
            }else{
                query+= 'WHERE OwnerId =:currentUser AND (RH_Title__c LIKE: text OR Rh_Status__c LIKE: text ) ';
                check = true;
            } 
            
        }

        if(title != null){
            String tle ='%'+ title +'%';
            if(check){
                query+= 'AND RH_Title__c LIKE :tle ';
            }else{
                query+= 'WHERE OwnerId =:currentUser  AND RH_Title__c LIKE :tle ';
                check = true;
            }
        }
        if(String.isNotBlank(status)){
            if(check){
                query+= 'AND Rh_Status__c =:status ';
            }else{
                query+= 'WHERE OwnerId =:currentUser AND Rh_Status__c =:status ';
                check = true;
            }
        }
        if(check){
            query+= 'ORDER BY createddate DESC';
            system.debug(query);
            return Database.query(query);
        }
        return null;
    }
}