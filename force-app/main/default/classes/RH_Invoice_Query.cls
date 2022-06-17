public without sharing class RH_Invoice_Query {
    /** The class instance */
    private static RH_Invoice_Query instance = null;

    /**
     * @description @return the class instance
     */
    public static RH_Invoice_Query getInstance() {

        if(instance == null) {

            instance = new RH_Invoice_Query();
        }
        return instance;
    }
    /** The class methods need to be replace with the coresponding of invoice object*/

    public List<TimeSheet> getUserTimeSheets(String userId) {
        return [SELECT Id,RH_Name__c,TimeSheetNumber,TotalDurationInHours,TotalDurationInMinutes,TimeSheetEntryCount, EndDate, StartDate,toLabel(Status) StatusLabel,Status,OwnerId,Owner.Name,RH_NoteApprover__c,
                RH_Approver__r.Account.Name,RH_Approver__r.Name,RH_Approver__r.RH_User__c ,
                (SELECT Id,Subject,TimeSheetEntryNumber, Description,DurationInMinutes, RH_Project__c,RH_Project__r.Name, StartTime, EndTime,Status,CreatedDate,TimeSheetId FROM TimeSheetEntries) FROM TimeSheet WHERE OwnerId =:userId];
    }
    public List<TimeSheet> getMyTimeSheets() {
        return getUserTimeSheets(UserInfo.getUserId());
    }
    public List<TimeSheet> getTimeSheet(String timesheetId) {
        return [SELECT Id,TimeSheetNumber,TotalDurationInHours,TotalDurationInMinutes,TimeSheetEntryCount, EndDate, StartDate,toLabel(Status) StatusLabel,Status,OwnerId,Owner.Name,RH_NoteApprover__c,
        RH_Total_Free_Duration_Minutes__c,	RH_Total_Free_Duration_Hours__c, RH_Name__c,       
        RH_Submiter__r.Account.Name,RH_Submiter__r.Account.Phone,RH_Submiter__r.Account.Type,RH_Submiter__r.Account.Website,RH_Submiter__r.Account.Owner.Name ,
                RH_Approver__r.Account.Name,RH_Approver__r.Name,RH_Approver__r.RH_User__c ,
                (SELECT Id,Subject,TimeSheetEntryNumber, Description,DurationInMinutes, RH_Project__c,RH_Project__r.Name, StartTime, EndTime,Status,CreatedDate,TimeSheetId,RH_Optional__c FROM TimeSheetEntries) FROM TimeSheet WHERE Id =:timesheetId];
    }
    public List<TimeSheet> getAllTimeSheet() {
        return [SELECT Id,RH_Name__c,TimeSheetNumber,TotalDurationInHours,TotalDurationInMinutes,TimeSheetEntryCount, EndDate, StartDate,toLabel(Status) StatusLabel,Status,OwnerId,Owner.Name, 
                (SELECT Id,Subject,TimeSheetEntryNumber, Description,DurationInMinutes, RH_Project__c,RH_Project__r.Name, StartTime, EndTime,Status,CreatedDate,TimeSheetId FROM TimeSheetEntries) FROM TimeSheet ];
    }
    public List<TimeSheet> getUserTodayTimeSheets(String userId) {
        return [SELECT Id,RH_Name__c,TimeSheetNumber,TotalDurationInHours,TotalDurationInMinutes,TimeSheetEntryCount, EndDate, StartDate,toLabel(Status) StatusLabel,Status,OwnerId,Owner.Name FROM TimeSheet 
        WHERE StartDate = THIS_MONTH];
    }
    
    public  Map<Id,TimeSheet> getFilteredTimesheets(RH_Invoice_Controller.TimeSheetFilterWrapper filter,String UserId){
        
        String status=filter.status;
        Date startdate=filter.startdate;
        Date enddate=filter.enddate;
        String ordBy=String.isNotBlank(filter.orderBy)?filter.orderBy: ' CreatedDate ' ;
        String ordOn= String.isNotBlank(filter.orderOn)?filter.orderOn: ' DESC ';

        String query = 'Select ' 
        +'Id,Status,TimeSheetNumber,TotalDurationInHours,RH_Name__c,'
        +'TotalDurationInMinutes,TimeSheetEntryCount,toLabel(Status) StatusLabel,'
        +'StartDate,EndDate,CreatedDate from TimeSheet '; 
        
        String queryWhere = ' Where OwnerId = :userId';
        
        if(String.isNotBlank(status)){
			queryWHERE = queryWHERE + ' AND (Status =: status) ';
		}
        if(startdate != null){
			queryWHERE = queryWHERE + ' AND (StartDate >= : startdate) ';
		}
        if(enddate != null){
			queryWHERE = queryWHERE + ' AND (StartDate <= : enddate) ';
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
