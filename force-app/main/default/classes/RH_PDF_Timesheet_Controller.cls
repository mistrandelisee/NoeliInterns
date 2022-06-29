public  class RH_PDF_Timesheet_Controller {
    private static RH_Timesheet_Query timesheetQry = RH_Timesheet_Query.getInstance();
    public  List<timesheetListObj> timeSheetEntryList {get; set;}
    public  TimeSheet timeSheetList {get; set;}
    public  timesheetAccount   accountList{get;set;}
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
        accountList = buildAccObj(TimeSheets[0]);
         
    }
  
   public static timesheetAccount buildAccObj(TimeSheet sheet){
       Account acc = new Account();
       acc = sheet.RH_Submiter__r.Account;
       timesheetAccount tt =new timesheetAccount();
       tt.Name = acc?.Name;
       tt.phone = acc?.Phone;
       tt.Type = acc?.Type;
       tt.website = acc?.Website;
       tt.owner = acc?.Owner.Name;

       return tt;
   }
   public static timesheetObj buildObj(TimeSheet sheet){
        timesheetObj sheetObj=new timesheetObj();
        //sheetObj.status=string.valueOf(sheet.get('StatusLabel'));
        sheetObj.status=sheet.Status;
        sheetObj.timesheetNumber=sheet.TimeSheetNumber;
        sheetObj.StartDate = sheet.StartDate;
        sheetObj.Duration = sheet.TotalDurationInHours;
        sheetObj.OwnerName = sheet.Owner.Name;


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
      public String OwnerName { get; set; }
   }

   public class timesheetListObj{
       public Datetime StartTime { get; set; }
       public Datetime EndTime { get; set; } 
       public Integer Duration{ get; set; }
       public String ProjectName{ get; set; }

   }

   public class timesheetAccount{
       public String Name {get;set;}
       public String phone {get;set;}
       public String Type {get;set;}
       public String website {get;set;}
       public String owner {get;set;}

   }
}