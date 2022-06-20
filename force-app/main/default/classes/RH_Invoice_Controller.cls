public with sharing class RH_Invoice_Controller {
    private static RH_User_Query userQry = RH_User_Query.getInstance();
    private static RH_Project_Query projectQry = RH_Project_Query.getInstance();
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();
    private static RH_WorkGroup_Query workGroupQry = RH_WorkGroup_Query.getInstance();
    private static RH_Invoice_Query invoiceQry = RH_Invoice_Query.getInstance();
    private static RH_TimeSheetEntry_Query timeSheetEntryQry = RH_TimeSheetEntry_Query.getInstance();
    
    @AuraEnabled 
    public static Map<String,Object>  timeSheetCreation(){
        Map<String, Object> mapReturn = new Map<String, Object>();
        
        mapReturn.put('error',false);
        try {
            Contact con=RH_Utility.getCurentContact();
            String myUserId=UserInfo.getUserId();
            List<TimeSheet> mytodaySheets = invoiceQry.getUserTodayTimeSheets(myUserId);
            if (!myTodaySheets.isEmpty()){
                mapReturn.put('myTodaySheets',myTodaySheets);
                throw new RH_ControllerException('002','Exisisting TimeSheet On this date');
                
            }
            ServiceResource sr=new ServiceResource(RH_External_ID__c=myUserId,IsActive=true,ResourceType='T',
                    RelatedRecordId=myUserId, Name=UserInfo.getName());
            upsert sr RH_External_ID__c;
            TimeSheet myTimesheet = new TimeSheet(
                StartDate= System.Today(),
                RH_Submiter__c=con.Id,
                RH_Approver__c=con.RH_WorkGroup__r.RH_Team_Leader__c,
                ServiceResourceId=sr.Id,//'0Hn7Q0000004zSNSAY',//TO DO: remove and store in constants, then take values from custom Settings
                EndDate= System.Today().addMonths(1).toStartofMonth().addDays(-1),//last day of the month
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
    public static Map<String,Object>  InitFilter(){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            List<RH_Utility.PickOption> OrderBys = new List<RH_Utility.PickOption>();
            OrderBys.add(new RH_Utility.PickOption('None', ''));
            OrderBys.add(new RH_Utility.PickOption('Created Date', 'CreatedDate'));
            // OrderBys.add(new RH_Utility.PickOption('Number', 'TimeSheetNumber'));
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

    /*@AuraEnabled 
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
    }*/

   

    @AuraEnabled
    public static Map<String,Object> getInvoices(String filterTxt){

        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);

        try {
            mapReturn.put('filterTxt',filterTxt); 
            InvoiceFilterWrapper filter = (InvoiceFilterWrapper) JSON.deserialize(filterTxt, InvoiceFilterWrapper.class); 
            Map<Id, RH_Invoice__c> mapInvoices = invoiceQry.getFilteredInvoices(filter);
            
            mapReturn.put('in',filter); 
            mapReturn.put('Invoices',mapInvoices.values()); 
            mapReturn.put('isMine',true);
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
    public static Map<String,Object>  getInvoice(String invoiceId){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            String myUserId=UserInfo.getUserId();
            List<RH_Invoice__c> Invoices = invoiceQry.getInvoice(invoiceId);
            if (Invoices.isEmpty()) {
                throw new RH_ControllerException('002','No Timsheet founded with this ID'+invoiceId);
            }
            RH_Invoice__c theInvoice=Invoices[0];
            String userId=theInvoice.OwnerId;
            mapReturn.put('Invoice',theInvoice); 
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
    public static Map<String,Object>  deleteInvoice(String invoiceId){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            delete new RH_Invoice__c(Id=invoiceId);
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
                    throw new RH_ControllerException('002','You don\'t have a Team Leader! Contact your Administrator for Help');
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
    @AuraEnabled 
    public static Map<String,Object>  invoiceItemCreation(String entryJson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            
            mapReturn.put('Input',entryJson);
            invoiceItemWrapper entryInfo = (invoiceItemWrapper) JSON.deserialize(entryJson, invoiceItemWrapper.class);
            RH_Invoice_Item__c invoiceItem =entryInfo.getEntry();
            invoiceItem.RH_Amount__c=entryInfo.calculateAmount();
            Boolean isInsert= String.isBlank(invoiceItem.Id);
            upsert invoiceItem;
            mapReturn.put('invoiceItem',invoiceItem);
            
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
    public static Map<String,Object>  InitInvoiceItemCreation(String infoJson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        Map<String, Object> mapInputs = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            mapInputs = (Map<String, Object>) JSON.deserializeUntyped(infoJson);
            String accountId=mapInputs.get('accountId') != Null ? String.valueOf(mapInputs.get('accountId')) : 'unknown';
            //get projects of this account
            List<Project__c> Projects = projectQry.getProjectsByAccount(accountId);
            
            mapReturn.put('Projects',Projects); 
            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage()+' '+e.getStackTraceString());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    }

    public class invoiceItemWrapper  {
        @AuraEnabled public String projectId;
        @AuraEnabled public String invoiceId;
        @AuraEnabled public String ressourceId;
        @AuraEnabled public Decimal quantity ;
        @AuraEnabled public Decimal rate ;
        @AuraEnabled public String currencyCode ;
        @AuraEnabled public Decimal holiday;
        @AuraEnabled public String Id;
        @AuraEnabled public Date startDate;
        @AuraEnabled public Date endDate;
        public RH_Invoice_Item__c getEntry() {
            return new RH_Invoice_Item__c(
                RH_ProjectId__c=this.projectId,
                RH_InvoiceId__c=this.invoiceId,
                RH_Ressource__c=this.ressourceId,
                RH_Quantity__c=this.quantity,
                RH_Rate__c=this.rate,
                RH_Currency_Code__c=this.currencyCode,
                RH_Holiday__c=this.holiday,
                Id=this.Id,
                RH_StartDate__c=this.startDate,
                RH_EndDate__c=this.endDate
                );
        }
        public Decimal calculateAmount(){
            return this.quantity*this.rate;
        }
    }

    @AuraEnabled 
    public static Map<String,Object>  InitInvoiceCreation(){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            String filter=' recordTypeId= \''+RH_Constans.RH_CLIENT_ACCOUNT_RT + '\' ';
            mapReturn.put('filter', filter); 
            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage()+' '+e.getStackTraceString());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    }

    @AuraEnabled 
    public static Map<String,Object>  invoiceCreation(String invoiceJson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            mapReturn.put('Input',invoiceJson);
            invoiceWrapper invoiceInfo = (invoiceWrapper) JSON.deserialize(invoiceJson, invoiceWrapper.class);
            RH_Invoice__c inv =invoiceInfo.getInvoice();
            Boolean isInsert= String.isBlank(inv.Id);
            mapReturn.put('invoice',inv);
            upsert inv;
            if(isInsert){
                // insert inv;
            }else{
                // update inv;
            }
            
            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage()+' '+e.getStackTraceString());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    }
    
    public class invoiceWrapper  {
        @AuraEnabled public String AccountId;
        @AuraEnabled public String Id;
        @AuraEnabled public Date startDate;
        @AuraEnabled public Date endDate;
        @AuraEnabled public String po;
        public RH_Invoice__c getInvoice() {
            return new RH_Invoice__c(
                RH_Account_Id__c=this.AccountId, 
                Id=this.Id, 
                RH_InvoiceDate__c=this.startDate, 
                RH_DueDate__c=this.endDate, 
                RH_Po__c=this.po
                );
        }
    }  
    @AuraEnabled 
    public static Map<String,Object>  accountCreation(String accountJson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            
            mapReturn.put('Input',accountJson);
            accountWrapper accInfo = (accountWrapper) JSON.deserialize(accountJson, accountWrapper.class);
            Account clientAccount =accInfo.getAccount();
            insert clientAccount;
            mapReturn.put('account',clientAccount);
            
            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage()+' '+e.getStackTraceString());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    }
    @AuraEnabled 
    public static Map<String,Object>  ressourceCreation(String ressourceJson){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            
            mapReturn.put('Input',ressourceJson);
            ressourceWrapper resInfo = (ressourceWrapper) JSON.deserialize(ressourceJson, ressourceWrapper.class);
            RH_Project_controller.addParticipants(new List<String>{resInfo.ContactId} , resInfo.ProjectId);
            
            mapReturn.put('Ok',true); 
            mapReturn.put('contact',contactQry.getContactById(resInfo.ContactId)[0]);//will always return a record 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage()+' '+e.getStackTraceString());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    }
    public class accountWrapper  {
        @AuraEnabled public String Name;
        @AuraEnabled public String Phone;
        public Account getAccount() {
            return new Account(
                Name=this.Name, 
                Phone=this.Phone, 
                
                recordTypeId=RH_Constans.RH_CLIENT_ACCOUNT_RT
                );
        }
    } 
    public class ressourceWrapper  {
        @AuraEnabled public String ProjectId;
        @AuraEnabled public String ContactId;
    } 

    public class InvoiceFilterWrapper {
        @AuraEnabled public Date startDate{get;set;}
        @AuraEnabled public Date endDate{get;set;}
        @AuraEnabled public String orderBy{get;set;}
        @AuraEnabled public String orderOn{get;set;}
    }
    
}