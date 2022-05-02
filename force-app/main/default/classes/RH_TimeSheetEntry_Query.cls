public  class RH_TimeSheetEntry_Query {
    /** The class instance */
    private static RH_TimeSheetEntry_Query instance = null;

    /**
     * @description @return the class instance
     */
    public static RH_TimeSheetEntry_Query getInstance() {

        if(instance == null) {

            instance = new RH_TimeSheetEntry_Query();
        }
        return instance;
    }

    public List<TimeSheetEntry> getTimesheetEntries(String TimeSheetId) {
        return [SELECT Id,Subject, Description,RH_Project__r.Name,TimeSheet.Owner.Name,TimeSheetEntryNumber,DurationInMinutes, RH_Project__c, StartTime, EndTime,Status,CreatedDate,TimeSheetId FROM TimeSheetEntry WHERE TimeSheetId =:TimeSheetId];
    }

    public List<TimeSheetEntry> getOverlapsEntries(String TimeSheetId,Datetime startDate,Datetime endDate,String TimeSheetEntryId) {//get entries wich fall in the same intervals
        return [SELECT Id,Subject, Description, RH_Project__c, StartTime, EndTime,Status,CreatedDate,TimeSheetId FROM TimeSheetEntry 
                    WHERE  TimeSheetId =:TimeSheetId AND StartTime<:endDate AND EndTime >:startDate AND Id !=:TimeSheetEntryId];
    }
    
}