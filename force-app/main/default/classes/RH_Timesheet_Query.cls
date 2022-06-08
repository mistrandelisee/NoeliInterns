public  class RH_Timesheet_Query {
    /** The class instance */
    private static RH_Timesheet_Query instance = null;
    public static String PROFILENAME = 'Custom Identity User';

    /**
     * @description @return the class instance
     */
    public static RH_Timesheet_Query getInstance() {

        if(instance == null) {

            instance = new RH_Timesheet_Query();
        }
        return instance;
    }

    public List<TimeSheet> getUserTimeSheets(String userId) {
        return [SELECT Id,TimeSheetNumber,TotalDurationInHours,TotalDurationInMinutes,TimeSheetEntryCount, EndDate, StartDate,toLabel(Status) StatusLabel,Status,OwnerId,Owner.Name,RH_NoteApprover__c,
                RH_Approver__r.Account.Name,RH_Approver__r.Name,RH_Approver__r.RH_User__c ,
                (SELECT Id,Subject,TimeSheetEntryNumber, Description,DurationInMinutes, RH_Project__c,RH_Project__r.Name, StartTime, EndTime,Status,CreatedDate,TimeSheetId FROM TimeSheetEntries) FROM TimeSheet WHERE OwnerId =:userId];
    }
    public List<TimeSheet> getMyTimeSheets() {
        return getUserTimeSheets(UserInfo.getUserId());
    }
    public List<TimeSheet> getTimeSheet(String timesheetId) {
        return [SELECT Id,TimeSheetNumber,TotalDurationInHours,TotalDurationInMinutes,TimeSheetEntryCount, EndDate, StartDate,toLabel(Status) StatusLabel,Status,OwnerId,Owner.Name,RH_NoteApprover__c,
                RH_Submiter__r.Account.Name,RH_Submiter__r.Account.Phone,RH_Submiter__r.Account.Type,RH_Submiter__r.Account.Website,RH_Submiter__r.Account.Owner.Name ,
                RH_Approver__r.Account.Name,RH_Approver__r.Name,RH_Approver__r.RH_User__c ,
                (SELECT Id,Subject,TimeSheetEntryNumber, Description,DurationInMinutes, RH_Project__c,RH_Project__r.Name, StartTime, EndTime,Status,CreatedDate,TimeSheetId FROM TimeSheetEntries) FROM TimeSheet WHERE Id =:timesheetId];
    }
    public List<TimeSheet> getAllTimeSheet() {
        return [SELECT Id,TimeSheetNumber,TotalDurationInHours,TotalDurationInMinutes,TimeSheetEntryCount, EndDate, StartDate,toLabel(Status) StatusLabel,Status,OwnerId,Owner.Name, 
                (SELECT Id,Subject,TimeSheetEntryNumber, Description,DurationInMinutes, RH_Project__c,RH_Project__r.Name, StartTime, EndTime,Status,CreatedDate,TimeSheetId FROM TimeSheetEntries) FROM TimeSheet ];
    }
    public List<TimeSheet> getUserTodayTimeSheets(String userId) {
        return [SELECT Id,TimeSheetNumber,TotalDurationInHours,TotalDurationInMinutes,TimeSheetEntryCount, EndDate, StartDate,toLabel(Status) StatusLabel,Status,OwnerId,Owner.Name FROM TimeSheet WHERE OwnerId =:userId AND StartDate = THIS_MONTH];
    }
    
    public static Map<Id,TimeSheet> getFilteredTimesheets(RH_Timesheet_Controller.TimeSheetFilterWrapper filter,String UserId){
        
        String status=filter.status;
        DateTime startdate=filter.startdate;
        DateTime enddate=filter.enddate;
        String ordBy=String.isNotBlank(filter.orderBy)?filter.orderBy: ' CreatedDate ' ;
        String ordOn= String.isNotBlank(filter.orderOn)?filter.orderOn: ' DESC ';

        String query = 'Select ' 
        +'Id,Status,TimeSheetNumber,TotalDurationInHours,'
        +'TotalDurationInMinutes,TimeSheetEntryCount,'
        +'StartDate,EndDate,CreatedDate from TimeSheet '; 
        
        String queryWhere = 'Where OwnerId = :userId ';
        
        if(String.isNotBlank(status)){
			queryWHERE = queryWHERE + 'AND (Status =: status) ';
		}
        if(startdate != null){
			queryWHERE = queryWHERE + 'AND (CreatedDate >= : startdate) ';
		}
        if(enddate != null){
			queryWHERE = queryWHERE + 'AND (CreatedDate <= : enddate) ';
		}
        String queryORDER='';
        if(String.isNotBlank(ordBy)){

			queryORDER = queryORDER + ' Order by '+ordBy+' '+ordOn;
		}
        
        query= query+queryWHERE+queryORDER;

        Map<Id, TimeSheet> timesheetMap=new Map<Id, TimeSheet>((List<TimeSheet>) Database.query(query));
        
        return timesheetMap;
    }
}