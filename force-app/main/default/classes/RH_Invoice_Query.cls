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
    public List<RH_Invoice__c> getInvoice(String invoiceId) {
        return [SELECT Id,Name,RH_Name__c,RH_DueDate__c,RH_InvoiceDate__c,RH_Po__c, OwnerId, RH_InvoiceItem_Sum__c, 
                        RH_Account_Id__r.Name,RH_Account_Id__r.Phone,RH_Account_Id__r.Type,RH_Account_Id__r.Website, 
                (SELECT Id,RH_StartDate__c,RH_EndDate__c, Name, RH_Quantity__c,RH_Rate__c,RH_Amount__c,RH_Holiday__c,RH_Currency_Code__c, toLabel(RH_Currency_Code__c) currency,RH_InvoiceId__c,
                RH_ProjectId__r.Name, RH_ProjectId__r.Is_Effective__c, RH_ProjectId__r.RH_Account_ID__c,
                RH_Ressource__r.Name,RH_Ressource__r.RH_User__c FROM RH_Invoices_Items__r) 
                FROM 	RH_Invoice__c WHERE Id =:invoiceId];
    }
    public  Map<Id,RH_Invoice__c> getFilteredInvoices(RH_Invoice_Controller.InvoiceFilterWrapper filter){
        
        Date startdate=filter.startdate;
        Date enddate=filter.enddate;
        String ordBy=String.isNotBlank(filter.orderBy)?filter.orderBy: ' CreatedDate ' ;
        String ordOn= String.isNotBlank(filter.orderOn)?filter.orderOn: ' DESC ';

        String query = 'SELECT Id,Name,RH_Name__c,RH_Account_Id__r.Name,RH_DueDate__c,RH_InvoiceDate__c,RH_Po__c,'
        +'CreatedDate FROM RH_Invoice__c '; 
        
        String queryWhere = ' Where RH_Account_Id__c != Null ';
        
        
        if(startdate != null){
			queryWHERE = queryWHERE + ' AND (RH_InvoiceDate__c >= : startdate) ';
		}
        if(enddate != null){
			queryWHERE = queryWHERE + ' AND (RH_DueDate__c <= : enddate) ';
		}
        String queryORDER='';
        if(String.isNotBlank(ordBy)){

			queryORDER = queryORDER + ' Order by '+ordBy+' '+ordOn;
		}
        
        query= query+queryWHERE+queryORDER;

        Map<Id, RH_Invoice__c> invoicesMap=new Map<Id, RH_Invoice__c>((List<RH_Invoice__c>) Database.query(query));
        
        return invoicesMap;
    }
}