public class RH_Request_Query {
    /** The class instance */
    private static RH_Request_Query instance = null;

    /**
     * @description @return the class instance
     */
    public static RH_Request_Query getInstance() {

        if(instance == null) {

            instance = new RH_Request_Query();
        }
        return instance;
    }

    /* pb avec le oznerId qui doit etre lid du rh contact*/
	public List<RH_Request__c> getLastrequest(Integer edLimit) {
        return [SELECT id,Name,RH_Description__c,Rh_Status__c,RH_Addressed_To__r.Name,RecordType.Name ,CreatedDate,RH_Request_Type__c FROM RH_Request__c WHERE ownerId =:UserInfo.getUserId() order by createddate desc limit : edLimit ];
    }
/** 
    public List<RH_Request__c> getAllMyRequestByYear(Integer year,String contactId) {
        return [SELECT id,Name,RH_Description__c,Rh_Status__c,RH_Addressed_To__r.Name,RecordType.Name ,CreatedDate,RH_Request_Type__c FROM RH_Request__c WHERE  CALENDAR_YEAR(CreatedDate) =: year AND (Rh_Status__c='Submited' OR Rh_Status__c='Approved' OR Rh_Status__c='Rejected' OR Rh_Status__c='Draft' )];
    }*/

    public List<RH_Request__c> getAllMyRequestByYear(Integer year,String contactId) {
        return [SELECT id,Name,RH_Description__c,Rh_Status__c,RH_Addressed_To__r.Name,RecordType.Name ,CreatedDate,RH_Request_Type__c FROM RH_Request__c WHERE ownerId =: UserInfo.getUserId() AND CALENDAR_YEAR(CreatedDate) =: year AND (Rh_Status__c='Submited' OR Rh_Status__c='Approved' OR Rh_Status__c='Rejected' OR Rh_Status__c='Draft' )];
    } 

    public List<RH_Request__c> getRequest() {
        return [SELECT id,Name,RH_Description__c,toLabel(Rh_Status__c) Rh_Status,Rh_Status__c, RH_Addressed_To__r.Name,RH_Note__c,toLabel(RecordType.Name) ,CreatedDate,RH_Request_Type__c FROM RH_Request__c WHERE ownerId =: UserInfo.getUserId() ORDER BY CreatedDate desc];
    }

    public RH_Request__c retreiveRequest(String requestId){
        return [SELECT Id, Name, RH_Description__c , CreatedBy.Name,RH_Addressed_To__r.Name, toLabel(Rh_Status__c) Rh_Status,Rh_Status__c, RH_Start_date__c, 
        RH_End_date__c, RH_Reason__c, RH_Date_Response__c, RH_Date_Submit__c, RH_Answer__c, RH_Parent_Request_Id__c,RH_Complain_On__r.Id,RH_Complain_On__r.Name, RH_Note__c,RecordTypeId,toLabel(RecordType.Name), RecordType.DeveloperName, (SELECT Id, RH_Contact__c, RH_Contact__r.Name FROM Adressedccs__r) FROM RH_Request__c WHERE Id =: requestId ];
    }

    public List<RecordType> getRecordType(){
        return [SELECT Id,toLabel(Name) Name, DeveloperName FROM RecordType WHERE sObjectType='RH_Request__c' AND DeveloperName != 'Explanation'];
    }

    public List<RecordType> getAllRecordType(){
        return [SELECT Id,toLabel(Name) Name, DeveloperName FROM RecordType WHERE sObjectType='RH_Request__c'];
    }

    public RecordType getExplanationType(){
        return [SELECT Id,toLabel(Name) Name, DeveloperName FROM RecordType WHERE sObjectType='RH_Request__c' AND DeveloperName = 'Explanation' LIMIT 1];
    }

    public List<RH_AdressedCC__c> getAdressByRequest(String requestId){
        return [SELECT Id, RH_Contact__c, RH_Request__c FROM RH_AdressedCC__c WHERE RH_Request__c = :requestId];
    }

    public List<RH_AdressedCC__c> getAdressByContact(String contactId){
        return [SELECT Id, RH_Contact__c, RH_Request__c FROM RH_AdressedCC__c WHERE RH_Contact__c = :contactId];
    }

    public List<RH_Request__c> getRequestToManage(String currentContact, List<String> requestIds){
        return [SELECT id,Name,RH_Description__c,toLabel(Rh_Status__c) Rh_Status,RH_Note__c,Rh_Status__c,CreatedBy.Name,RH_Addressed_Cc__c, RH_Addressed_To__r.Name,toLabel(RecordType.Name), RecordType.DeveloperName,CreatedDate,RH_Request_Type__c 
                 FROM RH_Request__c 
                 WHERE (RH_Addressed_To__c = :currentContact OR Id IN :requestIds) AND Rh_Status__c != 'Draft' ORDER BY CreatedDate DESC];
    }

    public RH_Request__c getRequestByParent(String requestId){
        return [SELECT Id, Name, RH_Description__c, RH_Addressed_To__r.Name,toLabel(Rh_Status__c) Rh_Status, Rh_Status__c, RH_Reason__c,RH_Date_Response__c, RH_Date_Submit__c, RH_Answer__c, RH_Parent_Request_Id__c, RecordType.Name FROM RH_Request__c WHERE RH_Parent_Request_Id__c =: requestId LIMIT 1];
    }
    
    public List<RH_Request__c> filterRequest(String searchText, String requestType, String status, Datetime dateFrom, Datetime dateTo, Integer type, String currentContact, List<String> requestIds){

        searchText = String.isNotBlank(searchText) ? searchText : '';
        String query= 'SELECT Id,Name,RH_Description__c,toLabel(Rh_Status__c) Rh_Status,Rh_Status__c,CreatedBy.Name,RH_Addressed_Cc__c,RH_Addressed_To__r.Name,RH_Note__c,toLabel(RecordType.Name),CreatedDate,RH_Request_Type__c FROM RH_Request__c ';
        Boolean check = false;
        String currentUser = UserInfo.getUserId();
        String draftStatus = 'Draft';
        String queryWhere = type == 0 ? 'OwnerId =:currentUser ' : '(RH_Addressed_To__c = :currentContact OR Id IN :requestIds) AND Rh_Status__c != :draftStatus ';
        
        System.debug('#This is text ' +searchText);

        if(searchText != null){

            String text = '%'+searchText+'%';

            System.debug('#This is transformed text' +text);
            
            if(check){
                query+= ' AND (Name LIKE: text OR Rh_Status__c LIKE: text ) ';
            }else{
                query+= 'WHERE '+queryWhere+'AND (Name LIKE: text OR Rh_Status__c LIKE: text ) ';
                check = true;
            } 
            
        }
        
        if(String.isNotBlank(requestType)){
            if(check){
                query+= 'AND RecordTypeId =:requestType ';
            }else{
                query+= 'WHERE '+queryWhere+'AND RecordTypeId =:requestType ';
                check = true;
            }
        }
        if(String.isNotBlank(status)){
            if(status != 'All'){
                if(check){
                    query+= 'AND Rh_Status__c =:status ';
                }else{
                    query+= 'WHERE '+queryWhere+'AND Rh_Status__c =:status ';
                    check = true;
                }
            } 
        }
        if(dateFrom != null){
            if(check){
                query+= 'AND CreatedDate >= :dateFrom ';
            }else{
                query+= 'WHERE '+queryWhere+'AND CreatedDate >= :dateFrom ';
                check = true;
            }
        }
        if(dateTo != null){
            Datetime myDateTo = dateTo.addDays(1);
            if(check){
                query+= 'AND CreatedDate < :myDateTo ';
            }else{
                query+= 'WHERE '+queryWhere+'AND CreatedDate < :myDateTo ';
                check = true;
            }
        }
        if(check || status == 'All'){
            query+= 'ORDER BY CreatedDate DESC';
            system.debug('#### My Request ###'+query);
            return Database.query(query);
        }
        return null;
    }

}