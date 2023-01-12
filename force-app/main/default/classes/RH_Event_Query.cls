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

	public List<Event__c> getMyLastEvent(Integer edLimit) {
        
        return [Select Id, Name,Contact_Id__c, Description__c, toLabel(Status__c)StatusLabel ,Status__c,Message__c From Event__c where CreatedById =: UserInfo.getUserId()  order by createddate desc limit : edLimit ];
    }
    public List<Event__c> getEventListByUserRole(String userRole, String conId ) {
        
        return  [SELECT Id,Name,Contact_Id__r.Name,Description__c, Start_Dates__c, End_Dates__c, toLabel(Status__c)StatusLabel ,Status__c, CreatedBy.UserRole.Name FROM Event__c 
                    Where Contact_Id__c =: conId And ( CreatedBy.UserRole.Name =: userRole And (Status__c=:'Submitted' Or Status__c=:'Rejected' Or Status__c=:'Draft')) 
                    order by createddate desc];
    }
    public List<Event__c> getMyEventManagerForCEO() {
        
        return  [SELECT Id,Name,Contact_Id__r.Name,Description__c, Start_Dates__c, End_Dates__c, toLabel(Status__c)StatusLabel, Status__c,Message__c, CreatedBy.UserRole.Name FROM Event__c Where
                (Status__c='Submitted' OR Status__c='Approved')
                order by createddate desc
        ];
    }
    public List<Event__c> getMyEventManagerForBaseUser() {
        
        return  [SELECT Id,Name,Contact_Id__r.Name,Description__c, Start_Dates__c, End_Dates__c, toLabel(Status__c)StatusLabel ,Status__c,Message__c, CreatedBy.UserRole.Name FROM Event__c Where
                (Status__c='Approved')
                order by createddate desc
                ];
    }
    public List<Event__c> getEventList(String eId) {
        
        return  [SELECT Id,Name,Contact_Id__c,Contact_Id__r.Name,Description__c,Start_Dates__c,End_Dates__c,toLabel(Status__c)StatusLabel ,Status__c,Message__c,CreatedBy.UserRole.Name FROM Event__c Where Id =: eId];
    }
    public List<Event__c> get_EventList() {
        
        return  [SELECT Id,Name,Contact_Id__c,Description__c,Start_Dates__c,End_Dates__c,toLabel(Status__c)StatusLabel ,Status__c,Message__c,CreatedBy.UserRole.Name FROM Event__c ];
    }
    public Event__c getEvent(String eId) {
        
        return  [SELECT Id,CreatedById,RH_Approver__r.Name,RH_Approver__r.RH_User__c,Name,Contact_Id__c,Contact_Id__r.Name,Description__c, Start_Dates__c, End_Dates__c, toLabel(Status__c)StatusLabel ,Status__c,Message__c,CreatedBy.UserRole.Name FROM Event__c Where Id =: eId];
    }
    public List<Event__c> getEvent() {
        
        return  [SELECT Id,Name,Contact_Id__c,Contact_Id__r.Name,Description__c, Start_Dates__c, End_Dates__c, toLabel(Status__c)StatusLabel ,Status__c,Message__c,CreatedBy.UserRole.Name FROM Event__c];
    }
    public  List<Event__c> getFilteredEvents(RH_EventController.FilterWrapper filter,String AccountId ){
        String text=String.isNotBlank(filter.searchText) ? '%'+filter.searchText+'%' :'';
        List<String> status=filter.status;
        DateTime startdate=filter.startdate;
        DateTime enddate=filter.enddate;
        String ownerId=filter.ownerId;
        String ordBy=String.isNotBlank(filter.orderBy)?filter.orderBy: ' CreatedDate ' ;
        String ordOn= String.isNotBlank(filter.orderOn)?filter.orderOn: ' DESC ';

        String query = 'SELECT Id,Name,Contact_Id__r.Name,Description__c, Start_Dates__c, End_Dates__c, toLabel(Status__c)StatusLabel, Status__c,Message__c, CreatedBy.UserRole.Name '
							+ ' FROM Event__c ';
        List<String> conds = new List<String>();
        String queryWHERE ='';
		if(String.isNotBlank(text)){
			//queryWHERE = queryWHERE + 'AND (Name LIKE: text OR Status__c LIKE: text ) ';
            conds.add('(Name LIKE: text OR Status__c LIKE: text )');
		}
        if(String.isNotBlank(AccountId)){
			//queryWHERE = queryWHERE + 'AND (Name LIKE: text OR Status__c LIKE: text ) ';
            conds.add('(Contact_Id__r.AccountId=:AccountId)');
		}
        if(String.isNotBlank(ownerId)){
			//queryWHERE = queryWHERE + 'AND (CreatedById =:ownerId ) ';
            conds.add('(CreatedById =:ownerId )');
		}
		if(status != null && !status.isEmpty()){
			//queryWHERE = queryWHERE + 'AND (Status__c IN: status) ';
            conds.add('(Status__c IN: status)');
		}
		if(startdate != null){
			//queryWHERE = queryWHERE + 'AND (Start_Dates__c >= : startdate) ';
            conds.add('(Start_Dates__c >= : startdate)');
		}
        if(enddate != null){
			//queryWHERE = queryWHERE + 'AND (End_Dates__c <= : enddate) ';
            conds.add('(End_Dates__c <= : enddate)');
		}

        String queryORDER='';
        if(String.isNotBlank(ordBy)){

			queryORDER = queryORDER + ' Order by '+ordBy+' '+ordOn;
		}
        if (!conds.isEmpty()) {
            queryWHERE = 'WHERE ' + String.Join(conds, ' AND ');
        }
        System.debug('########### query ' + query);
        System.debug('########### queryWHERE ' + queryWHERE);
        System.debug('########### queryORDER ' + queryORDER);
        query= query+queryWHERE+queryORDER;

        List<Event__c> events=Database.query(query);
        
        return events;

    }
}