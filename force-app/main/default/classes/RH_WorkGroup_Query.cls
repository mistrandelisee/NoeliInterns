public  class RH_WorkGroup_Query {
    
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

    public static RH_WorkGroup__c getGroupId(String idTeamLeader){
        return [SELECT Id, Name FROM RH_WorkGroup__c WHERE RH_Team_Leader__c =: idTeamLeader];
    }

   /* public static Map<String, Object>  getGroupContact(String id){
        Map<String, Object> mapName = new Map<String, Object>();
        try {
            RH_WorkGroup__c groupe = [SELECT Id, (SELECT Id, Name FROM RH_GroupMembers__r) 
                FROM RH_WorkGroup__c WHERE Id =: id];
            mapName.put('result', groupe);
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapName.put('error', e.getMessage());
        }
        
        return mapName;
    } */

    public static Map<String, Object> getFilteredGroup(RH_groupController.GroupFilterWrapper filterWrp){
        Map<String, Object> mapGroup = new Map<String, Object>();
        String text=String.isNotBlank(filterWrp.searchText) ? '%'+filterWrp.searchText+'%' :'';
        String status=filterWrp.status;
        String ordBy=String.isNotBlank(filterWrp.orderBy)?filterWrp.orderBy: ' CreatedDate ' ;
        String ordOn= String.isNotBlank(filterWrp.orderOn)?filterWrp.orderOn: ' DESC ';

        String query = 'SELECT Id,RH_Status__c, Name, RH_Description__c,  RH_Team_Leader__r.Name '
                            +'FROM RH_WorkGroup__c';
        String queryWHERE = ' WHERE ';
        if(String.isNotBlank(text)){
			queryWHERE = queryWHERE + 'Name LIKE: text ';
		}
        if (String.isNotBlank(status)) {
            queryWHERE = queryWHERE + 'AND (RH_Status__c =: status)';
        }  
        String queryORDER='';
        if(String.isNotBlank(ordBy)){

			queryORDER = queryORDER
             + ' Order by '+ordBy+' '+ordOn;
		}
        query= query+queryWHERE; //+queryORDER;
        System.debug('query to execute--->: ' + query);
        List<RH_WorkGroup__c> mlist = Database.query(query);
        mapGroup.put('liste', mlist);
        return mapGroup;
    }

}