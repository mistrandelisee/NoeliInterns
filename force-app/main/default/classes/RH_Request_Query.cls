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

	public List<RH_Request__c> getLastrequest(Integer edLimit) {
        return [SELECT id,Name,RH_Description__c,Rh_Status__c,RH_Addressed_To__r.Name,RecordType.Name ,CreatedDate,RH_RequestTypeName__c FROM RH_Request__c WHERE ownerId =: UserInfo.getUserId() order by createddate asc limit : edLimit ];
    }
}