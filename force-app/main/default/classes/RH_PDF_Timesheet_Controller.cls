public  class RH_PDF_Timesheet_Controller {
    private static RH_Timesheet_Query timesheetQry = RH_Timesheet_Query.getInstance();
    public  List<TimeSheetEntry> timeSheetEntryList {get; set;}
    public  TimeSheet timeSheetList {get; set;}
    public  TimeSheet   accountList{get;set;}
    public timesheetObj sheet { get; set; }
    public RH_PDF_Timesheet_Controller() {
        String listId = ApexPages.currentPage().getParameters().get('recordId');
        System.debug('@@@@@@@@@@@@@@@@@@@listId ' + listId);
        List<TimeSheet> TimeSheets = timesheetQry.getTimeSheet(listId);
        System.debug('@@@@@@@@@@@@@@@@@@@TimeSheets ' + TimeSheets);
        if (TimeSheets.isEmpty()) {
            throw new RH_ControllerException('002','No Timsheet founded with this ID'+listId);
        }
        timeSheetList=TimeSheets[0];
        sheet=buildObj(TimeSheets[0]);
        // timeSheetList = [SELECT ID,Status,TotalDurationInHours,StartDate from TimeSheet WHERE id= :listId];
        timeSheetEntryList=[SELECT id,StartTime,EndTime,RH_Project__r.Name,DurationInMinutes from TimeSheetEntry WHERE TimeSheetId= :listId];
        accountList = [SELECT ID,RH_Approver__r.Account.Name,RH_Approver__r.Account.Phone,RH_Approver__r.Account.Type,RH_Approver__r.Account.Website,RH_Approver__r.Account.Owner.Name from TimeSheet WHERE id= :listId];
         
    }
   public static timesheetObj buildObj(TimeSheet sheet){
        timesheetObj sheetObj=new timesheetObj();
        sheetObj.status=string.valueOf(sheet.get('StatusLabel'));
        sheetObj.timesheetNumber=sheet.TimeSheetNumber;

        System.debug('entries' + sheet.TimeSheetEntries);
        return sheetObj;
    }
   public class timesheetObj {
       
      public String Status { get; set; }
      public String timesheetNumber { get; set; }
   }
   public class timesheetEntryObj {
       
    public dateTime sart { get; set; }
    public String timesheetNumber { get; set; }
 }
}