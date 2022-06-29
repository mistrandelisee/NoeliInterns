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
        return [SELECT id,Name,RH_Description__c,Rh_Status__c,RH_Addressed_To__r.Name,RecordType.Name ,CreatedDate,RH_RequestTypeName__c FROM RH_Request__c WHERE ownerId =:UserInfo.getUserId() order by createddate desc limit : edLimit ];
    }
/** 
    public List<RH_Request__c> getAllMyRequestByYear(Integer year,String contactId) {
        return [SELECT id,Name,RH_Description__c,Rh_Status__c,RH_Addressed_To__r.Name,RecordType.Name ,CreatedDate,RH_RequestTypeName__c FROM RH_Request__c WHERE  CALENDAR_YEAR(CreatedDate) =: year AND (Rh_Status__c='Submited' OR Rh_Status__c='Approved' OR Rh_Status__c='Rejected' OR Rh_Status__c='Draft' )];
    }*/

    public List<RH_Request__c> getAllMyRequestByYear(Integer year,String contactId) {
        return [SELECT id,Name,RH_Description__c,Rh_Status__c,RH_Addressed_To__r.Name,RecordType.Name ,CreatedDate,RH_RequestTypeName__c FROM RH_Request__c WHERE ownerId =: UserInfo.getUserId() AND CALENDAR_YEAR(CreatedDate) =: year AND (Rh_Status__c='Submited' OR Rh_Status__c='Approved' OR Rh_Status__c='Rejected' OR Rh_Status__c='Draft' )];
    } 

    public List<RH_Request__c> getRequest() {
        return [SELECT id,Name,RH_Description__c,Rh_Status__c,RH_Addressed_To__r.Name,RH_Note__c,RecordType.Name ,CreatedDate,RH_RequestTypeName__c FROM RH_Request__c WHERE ownerId =: UserInfo.getUserId() ORDER BY CreatedDate desc];
    }

    public RH_Request__c retreiveRequest(String requestId){
        return [SELECT id, Name, RH_Description__c , CreatedBy.Name,RH_Addressed_To__r.Name, Rh_Status__c, RH_Start_date__c, 
        RH_End_date__c, RH_Parent_request_id__c, RH_Addressed_Cc__c, RH_Complain_On__r.Id,RH_Complain_On__r.Name, RH_Note__c,RecordTypeId,RecordType.Name  FROM RH_Request__c WHERE id =: requestId ];
    }

    public List<RecordType> getRecordType(){
        return [select Id,Name from RecordType where sObjectType='RH_Request__c' AND Name != 'Explanation'];
    }

}