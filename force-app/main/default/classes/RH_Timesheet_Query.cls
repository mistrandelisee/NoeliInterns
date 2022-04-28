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
        return [SELECT Id,TimeSheetNumber,TotalDurationInHours,TotalDurationInMinutes, EndDate, StartDate,toLabel(Status),OwnerId,Owner.Name, (SELECT Id,Subject, Description,DurationInMinutes, RH_Project__c, StartTime, EndTime,Status,CreatedDate,TimeSheetId FROM TimeSheetEntries) FROM TimeSheet WHERE OwnerId =:userId];
    }
    public List<TimeSheet> getMyTimeSheets() {
        return getUserTimeSheets(UserInfo.getUserId());
    }
    public List<TimeSheet> getTimeSheet(String timesheetId) {
        return [SELECT Id,TimeSheetNumber,TotalDurationInHours,TotalDurationInMinutes, EndDate, StartDate,toLabel(Status),OwnerId,Owner.Name, (SELECT Id,Subject, Description,DurationInMinutes, RH_Project__c, StartTime, EndTime,Status,CreatedDate,TimeSheetId FROM TimeSheetEntries) FROM TimeSheet WHERE Id =:timesheetId];
    }
    public List<TimeSheet> getAllTimeSheet() {
        return [SELECT Id,TimeSheetNumber,TotalDurationInHours,TotalDurationInMinutes, EndDate, StartDate,toLabel(Status),OwnerId,Owner.Name, (SELECT Id,Subject, Description,DurationInMinutes, RH_Project__c, StartTime, EndTime,Status,CreatedDate,TimeSheetId FROM TimeSheetEntries) FROM TimeSheet ];
    }
    public List<TimeSheet> getUserTodayTimeSheets(String userId) {
        return [SELECT Id,TimeSheetNumber,TotalDurationInHours,TotalDurationInMinutes, EndDate, StartDate,toLabel(Status),OwnerId,Owner.Name FROM TimeSheet WHERE OwnerId =:userId AND StartDate = TODAY];
    }
    
}
