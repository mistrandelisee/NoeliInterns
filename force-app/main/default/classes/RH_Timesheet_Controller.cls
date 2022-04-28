public without sharing class RH_Timesheet_Controller {
    private static RH_User_Query userQry = RH_User_Query.getInstance();
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();
    private static RH_WorkGroup_Query workGroupQry = RH_WorkGroup_Query.getInstance();
    private static RH_Timesheet_Query timesheetQry = RH_Timesheet_Query.getInstance();
    private static RH_TimeSheetEntry_Query timeSheetEntryQry = RH_TimeSheetEntry_Query.getInstance();
    
    @AuraEnabled 
    public static Map<String,Object>  timeSheetCreation(){
        Map<String, Object> mapReturn = new Map<String, Object>();
        
        mapReturn.put('error',false);
        try {
            String myUserId=UserInfo.getUserId();
            List<TimeSheet> mytodaySheets = timesheetQry.getUserTodayTimeSheets(myUserId);
            if (!myTodaySheets.isEmpty()){
                mapReturn.put('myTodaySheets',myTodaySheets);
                throw new RH_ControllerException('002','Exisisting TimeSheet On this date');
                
            }
            TimeSheet myTimesheet = new TimeSheet(
                StartDate= System.Today(),
                ServiceResourceId='0Hn7Q0000004zSNSAY',//TO DO: remove and store in constants, then take values from custom Settings
                EndDate= System.Today().addDays(1),
                Status='Nuovo'//TO DO: remove and store in constants
            );
            insert myTimesheet;
            mapReturn.put('Ok',true); 
            mapReturn.put('Timesheet',myTimesheet); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    }
    @AuraEnabled 
    public static Map<String,Object>  timeSheetEntryCreation(String entryJson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        List<String> listcontactId = new List<String>();
        mapReturn.put('error',false);
        try {
            mapReturn.put('Input',entryJson);
            entryWrapper entryInfo = (entryWrapper) JSON.deserialize(entryJson, entryWrapper.class);
            TimeSheetEntry myTimeSheetEntry =entryInfo.getEntry();
            myTimeSheetEntry.Status= 'Nuovo';//TO DO: remove and store in constants
            mapReturn.put('TimeSheetEntry',myTimeSheetEntry);
            //check existing getOverlapsEntries
            List<TimeSheetEntry> myOverlaps = timeSheetEntryQry.getOverlapsEntries(myTimeSheetEntry.TimeSheetId,myTimeSheetEntry.StartTime,myTimeSheetEntry.EndTime);
            if (myOverlaps.isEmpty()){
                insert myTimeSheetEntry;
                mapReturn.put('TimeSheetEntry',myTimeSheetEntry);
            }else{
                mapReturn.put('myOverlaps',myOverlaps);
                throw new RH_ControllerException('002','There is an overlapas');
                
            } 
            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    }

    @AuraEnabled 
    public static Map<String,Object>  getTimeSheets(String userId){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            String myUserId=UserInfo.getUserId();
            userId=String.isBlank(userId) ? myUserId : userId;

            mapReturn.put('TimeSheets',timesheetQry.getUserTimeSheets(userId) ); 
            
            mapReturn.put('isMine',myUserId.equalsIgnoreCase(userId));
            mapReturn.put('Constants',RH_Constans.getAllConstants());  
            mapReturn.putAll(RH_Utility.checkRole()); 
            // mapReturn.putAll(RH_Utility.checkRole()); 
            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    }
    @AuraEnabled 
    public static Map<String,Object>  getTimeSheet(String timesheetId){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            
            mapReturn.put('TimeSheet',timesheetQry.getTimeSheet(timesheetId)[0]); 

            // mapReturn.putAll(RH_Utility.checkRole()); 
            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    }
    @AuraEnabled 
    public static Map<String,Object>  InitEntryCreation(){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            List<User> users=userQry.getUserById(Userinfo.getUserId());
            if (users.isEmpty()) throw new RH_ControllerException('001','Missing User');
            User u=users[0];
            if (String.isBlank(u.RH_ContactId__c)) {
                throw new RH_ControllerException('002','This user is not a link to any RH Contact');
            }
            
            mapReturn.put('user', u);
            List<Contact> userContacts=contactQry.getContactById(u.RH_ContactId__c);
            if (userContacts.isEmpty()) throw new RH_ControllerException('002','No RH Contact Founded');

            Contact userContact=userContacts[0];
            mapReturn.put('userContact', userContact); 
            mapReturn.put('Projects', userContact.Projects__r); 
            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    }
    



    
    public class entryWrapper  {
        @AuraEnabled public String Description;
        @AuraEnabled public String TimeSheetId;
        @AuraEnabled public String Subject;
        @AuraEnabled public String ProjectId;
        @AuraEnabled public Datetime StartDate;
        @AuraEnabled public Datetime EndDate;
        public TimeSheetEntry getEntry() {
            return new TimeSheetEntry(
                RH_Project__c=this.ProjectId, 
                TimeSheetId=this.TimeSheetId, 
                Subject=this.Subject,  
                StartTime=this.StartDate, 
                EndTime=this.EndDate);
        }
    }  
}
