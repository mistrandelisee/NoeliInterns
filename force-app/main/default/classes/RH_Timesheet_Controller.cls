public without sharing class RH_Timesheet_Controller  implements RH_SummarizeInterface{
    private static RH_User_Query userQry = RH_User_Query.getInstance();
    private static RH_Project_Query projectQry = RH_Project_Query.getInstance();
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();
    private static RH_WorkGroup_Query workGroupQry = RH_WorkGroup_Query.getInstance();
    private static RH_Timesheet_Query timesheetQry = RH_Timesheet_Query.getInstance();
    private static RH_TimeSheetEntry_Query timeSheetEntryQry = RH_TimeSheetEntry_Query.getInstance();
    private static final  RH_Settings__c cs = RH_Settings__c.getOrgDefaults();
    public static Map<String,Object> StatusMapping = new Map<String, String>();
    public static Map<String,Object> LabelMapping = new Map<String, String>();
    private static String STATUSKEY='Status';
    
    private static final String APPROVE_STATUS='approvato';
    private static final String REJECT_STATUS='Reject';
    private static final String SUBMITTED_STATUS='inviato';
    private static final String OPEN_STATUS='nuovo';

    // private static String ROLEKEY='RH_Role__c';
    static{

        RH_Constans cons= RH_Constans.getAllConstants();
        StatusMapping= new Map<String, Object>{
            STATUSKEY.toLowerCase()=> new Map<String, String>{
                                APPROVE_STATUS.toLowerCase()=> ' slds-theme_success ',
                                SUBMITTED_STATUS.toLowerCase()=> ' slds-theme_warning ',
                                OPEN_STATUS.toLowerCase()=> ' slds-theme_alt-inverse ',
                                REJECT_STATUS.toLowerCase()=> ' slds-theme_error '
                            }
        };
        // String valueKey='Value'+fieldName;
        Map<String, Object> picklists=RH_Utility.getPickListOptions(new List<String> {/*ROLEKEY,*/STATUSKEY},'TimeSheet');
        LabelMapping= new Map<String, Object>{
            STATUSKEY.toLowerCase()=> (Map<String, String>)picklists.get('ValueStatus')/*,
            // ROLEKEY.toLowerCase()=> (Map<String, String>)picklists.get('')*/
        };
        // System.debug(picklists);
    }
    @AuraEnabled 
    public static Map<String,Object>  timeSheetCreation(String sheetJson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            String myUserId=UserInfo.getUserId();
            mapReturn.put('Input',sheetJson);
            sheetWrapper sheetInfo = (sheetWrapper) JSON.deserialize(sheetJson, sheetWrapper.class);
            TimeSheet myTimesheet =sheetInfo.getSheet();
            Boolean isInsert= String.isBlank(myTimesheet.Id);
            // checkDuplicate(myUserId,myTimesheet.Id,mapReturn);
            if(isInsert){
                Contact con=RH_Utility.getCurentContact();
                //create ressource necessary for the timesheet creation
                ServiceResource sr=new ServiceResource(RH_External_ID__c=myUserId,IsActive=true,ResourceType='T',
                        RelatedRecordId=myUserId, Name=UserInfo.getName());
                upsert sr RH_External_ID__c;
                myTimesheet.RH_Submiter__c=con.Id;
                myTimesheet.RH_Approver__c=con.RH_WorkGroup__r.RH_Team_Leader__c;
                myTimesheet.ServiceResourceId=sr.Id;
                myTimesheet.Status='Nuovo';//TO DO: remove and store in constants
            }else{

            }
            
            /* 
            }*/
            
            
            upsert myTimesheet;
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
    void checkDuplicate (String myUserId,String timesheetId,Map<String, Object> mapReturn){
        List<TimeSheet> mytodaySheets = timesheetQry.getUserTodayTimeSheets(myUserId);
        if (!myTodaySheets.isEmpty()){
            mapReturn.put('myTodaySheets',myTodaySheets);
            throw new RH_ControllerException('002',label.rh_ExistingSheet);
        }   
    }

    @AuraEnabled 
    public static Map<String,Object>  InitFilter(){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            List<RH_Utility.PickOption> OrderBys = new List<RH_Utility.PickOption>();
            OrderBys.add(new RH_Utility.PickOption(label.rh_None, ''));
            OrderBys.add(new RH_Utility.PickOption(label.rh_CreatedDate, 'CreatedDate'));
            OrderBys.add(new RH_Utility.PickOption(label.rh_Number, 'TimeSheetNumber'));
            // OrderBys.add(new RH_Utility.PickOption('Groups', 'RH_WorkGroup__c'));
            // OrderBys.add(new RH_Utility.PickOption('Created Date', 'CreatedDate'));
            // List<RH_WorkGroup__c> grps=workGroupQry.getActiveWorkgroups();
            
            mapReturn.put('OrderBys',OrderBys); 
            mapReturn.put('Picklists',RH_Utility.getPickListOptions(new List<String> {'Status'},'Timesheet')); 

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
    public static Map<String,Object>  timeSheetEntryCreation(String entryJson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            
            mapReturn.put('Input',entryJson);
            entryWrapper entryInfo = (entryWrapper) JSON.deserialize(entryJson, entryWrapper.class);
            TimeSheetEntry myTimeSheetEntry =entryInfo.getEntry();
            if (String.isNotBlank(entryInfo.ProjectId)) {
                List<Project__c> freeProjects=projectQry.checkFreeProject(entryInfo.ProjectId);
                if (! freeProjects.isEmpty()) {
                    myTimeSheetEntry.Type='Free';
                }else {
                    myTimeSheetEntry.Type='Diretto';
                }
            }
            Boolean isInsert= String.isBlank(myTimeSheetEntry.Id);
            if(isInsert){
                myTimeSheetEntry.Status= 'Nuovo';//TO DO: remove and store in constants
            }
            mapReturn.put('TimeSheetEntry',myTimeSheetEntry);
            //check existing getOverlapsEntries
            List<TimeSheetEntry> myOverlaps = timeSheetEntryQry.getOverlapsEntries(myTimeSheetEntry.TimeSheetId,myTimeSheetEntry.StartTime,myTimeSheetEntry.EndTime,myTimeSheetEntry.Id);
            if (myOverlaps.isEmpty()){
                if(isInsert){
                    insert myTimeSheetEntry;
                }else{
                    update myTimeSheetEntry;
                }
                mapReturn.put('TimeSheetEntry',myTimeSheetEntry);
            }else{
                mapReturn.put('myOverlaps',myOverlaps);
                throw new RH_ControllerException('002',label.rh_Overlap);
                
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

    
    public List<AggregateResult> getSummary(Map<String, Object> args) {
        String myUserId=UserInfo.getUserId();
        System.debug('get sum '+args);
        String groupByStr = String.valueOf(args.get(RH_Summarizer.GROUPBY_KEY));
        String fieldsStr = String.valueOf(args.get(RH_Summarizer.FIELDS_KEY));
        String conditionStr =null;
        conditionStr =' OwnerId = \''+String.escapeSingleQuotes(myUserId) +'\'';//+String.escapeSingleQuotes(recordTypeId) +'\' AND AccountId=\''+String.escapeSingleQuotes(AccountId) +'\' AND '+groupByStr+'!=Null '+addConds;
        String sobj = String.valueOf(args.get(RH_Summarizer.OBJECT_KEY));
        return RH_Summarizer.defauftSummirise(groupByStr,fieldsStr,conditionStr,sobj);
    } 
    public List<RH_Summarizer.summaryWrapper> formatAggregate(List<AggregateResult> aggs,Map<String, Object> args){
        String groupByStr = String.valueOf(args.get(RH_Summarizer.GROUPBY_KEY));
        String fieldsStr = String.valueOf(args.get(RH_Summarizer.FIELDS_KEY));
        String conditionStr= String.valueOf(args.get(RH_Summarizer.CONDITIONS_KEY));
        String sobj = String.valueOf(args.get(RH_Summarizer.OBJECT_KEY));
        String alias=groupByStr;// by default
        List<RH_Summarizer.summaryWrapper> sumaries = new List<RH_Summarizer.summaryWrapper>();
        Integer i=0; 
        Integer total=0; 
        for (AggregateResult agg : aggs) {
            RH_Summarizer.summaryWrapper swrap= new RH_Summarizer.summaryWrapper();
            String name=(String) agg.get(alias);
            swrap.label= getLabelMapping(groupByStr,name);
            swrap.value = (Integer) agg.get('sum');
            swrap.Key = name;
            swrap.className= getClassMapping(groupByStr,name);
            total= total + ( swrap.value!=Null?  swrap.value : 0); 
            sumaries.add(swrap);
            i=i+1;
        }
        /*RH_Summarizer.summaryWrapper allSum= new RH_Summarizer.summaryWrapper();
        allSum.label='ALL';
        allSum.value = total;
        allSum.Key = 'ALL';
        sumaries.add(allSum);*/

        return sumaries;
    }
    // RH_Users_controller.getClassMapping('rh_status__c', 'Active');
    public static String getClassMapping(String field, String Value){
        field= field?.toLowerCase();
        value= value?.toLowerCase();
        string cx=' defaut slds-theme_info ';
        Map<String,String> cxMapping=(Map<String,String>) StatusMapping.get(field);

        if (cxMapping != null) {
            cx= cxMapping.get(value); 
        }
        System.debug('@@@@@@field---> '+field+' Value---> '+Value+' cx---> '+cx);
        return cx;
    }
    public static String getLabelMapping(String field, String Value){
        field= field?.toLowerCase();
        value= value?.toLowerCase();
        string lb=Value;
        Map<String,String> lbMapping=(Map<String,String>) LabelMapping.get(field);

        if (lbMapping != null) {
            // System.debug('lbMapping ' + lbMapping);
            lb= lbMapping.get(value); 
        }
        System.debug('@@@@@@field---> '+field+' Value---> '+Value+' cx---> '+lb);
        return lb;
    }

    @AuraEnabled
    public static Map<String,Object> getTimeSheets(String filterTxt, String userId){

        Map<String, Object> mapReturn = new Map<String, Object>();
        // List<Map<String, Object>> listsheets = new List<Map<String, Object>>();
        mapReturn.put('error',false);

        try {

            String myUserId=UserInfo.getUserId();
            userId=String.isBlank(userId) ? myUserId : userId;

            mapReturn.put('filterTxt',filterTxt); 
            TimesheetFilterWrapper filter = (TimesheetFilterWrapper) JSON.deserialize(filterTxt, TimesheetFilterWrapper.class); 
            Map<Id, Timesheet> mapTimesheets = timesheetQry.getFilteredTimesheets(filter, UserId);
           
            mapReturn.put('in',filter); 
            mapReturn.put('TimeSheets',mapTimesheets.values()); 
            mapReturn.put('classMapping',StatusMapping.get(STATUSKEY.toLowerCase())); 
            mapReturn.put('isMine',myUserId.equalsIgnoreCase(userId));
            mapReturn.put('Constants',RH_Constans.getAllConstants());  
            mapReturn.putAll(RH_Utility.checkRole()); 
            mapReturn.put('Ok',true); 


        } catch (Exception e){
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage() + ' :  ' + e.getStackTraceString());
            mapReturn.put('e',e);
        }

        return mapReturn;
    }

    @AuraEnabled 
    public static Map<String,Object>  getTimeSheet(String timesheetId){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            String myUserId=UserInfo.getUserId();
            List<TimeSheet> TimeSheets = timesheetQry.getTimeSheet(timesheetId);
            if (TimeSheets.isEmpty()) {
                throw new RH_ControllerException('002','No Timsheet founded with this ID'+timesheetId);
            }
            TimeSheet theTimeSheet=TimeSheets[0];
            String userId=theTimeSheet.OwnerId;
            mapReturn.put('TimeSheet',TimeSheets[0]); 
            mapReturn.put('isMine',myUserId.equalsIgnoreCase(userId));
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
    public static Map<String,Object>  approvalTimesheet(String SheetJson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        Map<String, Object> mapInputs = new Map<String, Object>();

        mapReturn.put('error',false);
        try {
            
            mapReturn.put('Input',SheetJson);
            mapInputs = (Map<String, Object>) JSON.deserializeUntyped(SheetJson);
            String TimeSheetId = String.valueOf(mapInputs.get('Id'));
            String status = String.valueOf(mapInputs.get('status'));
            String note = String.valueOf(mapInputs.get('note'));
            String approverId = String.valueOf(mapInputs.get('approverId'));
            TimeSheet sheet= new TimeSheet(Id=TimeSheetId,RH_NoteApprover__c=note,Status=status,RH_Approver__c=approverId);
            update sheet;
            mapReturn.put('TimeSheet',sheet);
            
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
    public static Map<String,Object>  deleteTimeSheet(String timesheetId){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            delete new TimeSheet(Id=TimeSheetId);
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
    public static Map<String,Object>  deleteTimeSheetEntry(String timesheetEntryId){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            delete new TimeSheetEntry(Id=timesheetEntryId);
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
    public static Map<String,Object>  submitTimeSheet(String timesheetId){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            Contact con=RH_Utility.getCurentContact();
            String myUserId=UserInfo.getUserId();
            String Role=con.RH_Role__c;
            if (String.isBlank(con?.RH_WorkGroup__r.RH_Team_Leader__c)){

                if (!RH_Constans.CONTACT_ROLE_CEO.equalsIgnoreCase(Role) || !RH_Constans.CONTACT_ROLE_TL.equalsIgnoreCase(Role) ) {
                    throw new RH_ControllerException('002',label.rh_MissingTeamLeader);
                }
               
                
            }
            update new TimeSheet(Id=TimeSheetId, RH_Approver__c=con.RH_WorkGroup__r.RH_Team_Leader__c,Status='Inviato');
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
            List<Project__c> freeProjects = projectQry.getFreeProjects();
            Contact userContact=userContacts[0];
            mapReturn.put('userContact', userContact); 
            mapReturn.put('config', getAdditionnalConfig(System.today()));
            mapReturn.put('Projects', userContact.Projects__r); 
            mapReturn.put('freeActivities', freeProjects); 
            mapReturn.put('ProjectsLeaded', userContact.Projects_Leaded__r); 
            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    }

    private static  Map<String, Object> getAdditionnalConfig(Date currentDate){
        Map<String, Object> mapReturn = new Map<String, Object>();
        Integer END_OF_DAY=cs.RH_endHour__c!=null ? cs.RH_endHour__c.intValue() : 20;
        Integer START_OF_DAY=cs.RH_startHour__c!=null ? cs.RH_startHour__c.intValue() : 7;
        mapReturn.put('END_OF_DAY', END_OF_DAY); 
        mapReturn.put('START_OF_DAY', START_OF_DAY); 
        return mapReturn;
    }

    @AuraEnabled
    public static String generatedPDF(String listId){
        String fileContent = createPDF(listId);
        return fileContent;
    }


    // retrieve the content of the Pdf File
    public static String createPDF(String listId){
        Pagereference pg =Page.RH_PDF_Timesheet;
        System.debug(pg);
        pg.getParameters().put('recordId',listId);
       // Blob blb = Test.isRunningTest() ? blob.valueOf('Test') : pg.getContentAsPDF();
       Blob blb = Test.isRunningTest() ? blob.valueOf('Test') : pg.getContent();
        System.debug('doc Content : '+blb);
        return EncodingUtil.base64Encode(blb);
   }

   public class sheetWrapper  {
    @AuraEnabled public String Id;   
    @AuraEnabled public Date startDate;
    @AuraEnabled public Date endDate;
    public TimeSheet getSheet() {
        return new TimeSheet(
            Id=this.Id, 
            StartDate=this.StartDate,
            EndDate=this.EndDate);
    }
} 
    
    public class entryWrapper  {
        @AuraEnabled public String Description;
        @AuraEnabled public String Id;
        @AuraEnabled public String TimeSheetId;
        @AuraEnabled public String Subject;
        @AuraEnabled public String ProjectId;
        @AuraEnabled public Datetime StartTime;
        @AuraEnabled public Datetime EndTime;
        public TimeSheetEntry getEntry() {
            return new TimeSheetEntry(
                RH_Project__c=this.ProjectId, 
                Id=this.Id, 
                TimeSheetId=this.TimeSheetId, 
                Subject=this.Subject,  
                StartTime=this.StartTime, 
                Description=this.Description, 
                EndTime=this.EndTime);
        }
    }  

    public class TimesheetFilterWrapper {
        @AuraEnabled public String searchText{get;set;}
        @AuraEnabled public String status{get;set;}
        @AuraEnabled public Date startDate{get;set;}
        @AuraEnabled public Date endDate{get;set;}
        @AuraEnabled public Boolean isActive{get;set;}
        @AuraEnabled public String orderBy{get;set;}
        @AuraEnabled public String orderOn{get;set;}
    }
}