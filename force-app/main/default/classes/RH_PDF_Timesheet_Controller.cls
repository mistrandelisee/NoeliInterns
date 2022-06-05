public  class RH_PDF_Timesheet_Controller {
    private static RH_Timesheet_Query timesheetQry = RH_Timesheet_Query.getInstance();
    public  List<timesheetListObj> timeSheetEntryList {get; set;}
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
        timeSheetEntryList=buildListObj(TimeSheets[0]);
        Account acc=TimeSheets[0].RH_Submiter__r.Account;
        //acc.name error if acc==null
        // acc?.name no error
        // timeSheetList = [SELECT ID,Status,TotalDurationInHours,StartDate from TimeSheet WHERE id= :listId];
        //timeSheetEntryList=[SELECT id,StartTime,EndTime,RH_Project__r.Name,DurationInMinutes from TimeSheetEntry WHERE TimeSheetId= :listId];
        accountList = [SELECT ID,RH_Submiter__r.Account.Name,RH_Submiter__r.Account.Phone,RH_Submiter__r.Account.Type,RH_Submiter__r.Account.Website,RH_Submiter__r.Account.Owner.Name from TimeSheet WHERE id= :listId];
         
    }
  
   public static timesheetObj buildObj(TimeSheet sheet){
        timesheetObj sheetObj=new timesheetObj();
        //sheetObj.status=string.valueOf(sheet.get('StatusLabel'));
        sheetObj.status=sheet.Status;
        sheetObj.timesheetNumber=sheet.TimeSheetNumber;
        sheetObj.StartDate = sheet.StartDate;
        sheetObj.Duration = sheet.TotalDurationInHours;
        sheetObj.Duration = sheet.TotalDurationInHours;


        System.debug('entries' + sheet.TimeSheetEntries);
        return sheetObj;
    }

    
    public static List<timesheetListObj> buildListObj(TimeSheet sheet){
        List<timesheetListObj> listName = new List<timesheetListObj>();

        for(TimeSheetEntry sc :sheet.TimeSheetEntries){
            timesheetListObj timeObj =new timesheetListObj();
            timeObj.StartTime = sc.StartTime;
            timeObj.EndTime = sc.EndTime;
            timeObj.Duration = sc.DurationInMinutes;
            timeObj.ProjectName = sc.RH_Project__r.Name;

            listName.add(timeObj);
        }
        return listName;
    }
   public class timesheetObj {
       
      public String Status { get; set; }
      public String timesheetNumber { get; set; }
      public Datetime StartDate { get; set; }
      public Decimal Duration { get; set; }
   }

   public class timesheetListObj{
       public Datetime StartTime { get; set; }
       public Datetime EndTime { get; set; } 
       public Integer Duration{ get; set; }
       public String ProjectName{ get; set; }

   }
}