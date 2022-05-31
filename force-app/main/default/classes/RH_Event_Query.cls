public class RH_Event_Query {
	/** The class instance */
    private static RH_Event_Query instance = null;

    /**
     * @description @return the class instance
     */
    public static RH_Event_Query getInstance() {

        if(instance == null) {

            instance = new RH_Event_Query();
        }
        return instance;
    }

	public List<Event__c> getMyLastEvent(String rh_contactId, Integer edLimit) {
        
        return [Select Id, Name,Contact_Id__c, Description__c, Status__c,Message__c From Event__c where Contact_Id__c =: rh_contactId order by createddate asc limit : edLimit ];
    }
    public List<Event__c> getEventListByUserRole(String userRole, String conId ) {
        
        return  [SELECT Id,Name,Contact_Id__r.Name,Description__c, Start_Date__c, End_Date__c, Status__c, CreatedBy.UserRole.Name FROM Event__c 
                    Where Contact_Id__c =: conId And ( CreatedBy.UserRole.Name =: userRole And (Status__c=:'Submitted' Or Status__c=:'Rejected' Or Status__c=:'Draft')) 
                    order by createddate desc];
    }
    public List<Event__c> getMyEventManagerForCEO() {
        
        return  [SELECT Id,Name,Contact_Id__r.Name,Description__c, Start_Date__c, End_Date__c, Status__c,Message__c, CreatedBy.UserRole.Name FROM Event__c Where
                (Status__c='Submitted' OR Status__c='Approved')
                order by createddate desc
        ];
    }
    public List<Event__c> getMyEventManagerForBaseUser() {
        
        return  [SELECT Id,Name,Contact_Id__r.Name,Description__c, Start_Date__c, End_Date__c, Status__c,Message__c, CreatedBy.UserRole.Name FROM Event__c Where
                (Status__c='Approved')
                order by createddate desc
                ];
    }
    public List<Event__c> getEventList(String eId) {
        
        return  [SELECT Id,Name,Contact_Id__c,Contact_Id__r.Name,Description__c,Start_Date__c,End_Date__c,Status__c,Message__c,CreatedBy.UserRole.Name FROM Event__c Where Id =: eId];
    }
    public List<Event__c> get_EventList() {
        
        return  [SELECT Id,Name,Contact_Id__c,Description__c,Start_Date__c,End_Date__c,Status__c,Message__c,CreatedBy.UserRole.Name FROM Event__c ];
    }
    
    public Event__c getEvent(String eId) {
        
        return  [SELECT Id,Name,Contact_Id__c,Contact_Id__r.Name,Description__c, Start_Date__c, End_Date__c, Status__c,Message__c,CreatedBy.UserRole.Name FROM Event__c Where Id =: eId];
    }
}