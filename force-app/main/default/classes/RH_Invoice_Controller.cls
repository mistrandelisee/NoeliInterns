public with sharing class RH_Invoice_Controller {
    private static RH_User_Query userQry = RH_User_Query.getInstance();
    private static RH_Project_Query projectQry = RH_Project_Query.getInstance();
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();
    private static RH_Invoice_Query invoiceQry = RH_Invoice_Query.getInstance();
    
    @AuraEnabled 
    public static Map<String,Object>  InitFilter(){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            List<RH_Utility.PickOption> OrderBys = new List<RH_Utility.PickOption>();
            OrderBys.add(new RH_Utility.PickOption(label.rh_None, ''));
            OrderBys.add(new RH_Utility.PickOption(label.rh_CreatedDate, 'CreatedDate'));
            // OrderBys.add(new RH_Utility.PickOption('Number', 'TimeSheetNumber'));
            // OrderBys.add(new RH_Utility.PickOption('Groups', 'RH_WorkGroup__c'));
            // OrderBys.add(new RH_Utility.PickOption('Created Date', 'CreatedDate'));
            
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
                throw new RH_ControllerException('002','No Invoice founded with this ID'+invoiceId);
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
    public static Map<String,Object>  deleteInvoiceEntry(String invoiceEntryId){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            delete new RH_Invoice_Item__c(Id=invoiceEntryId);
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
    public static String createPDF(String recordId){
        Pagereference pg =Page.RH_PDF_Invoice;
        System.debug('@@@@@@@@@@@@@ pg'+pg);
        pg.getParameters().put('key',recordId);
        //Blob blb = Test.isRunningTest() ? blob.valueOf('Test') : pg.getContentAsPDF();
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
            mapReturn.put('msg',e.getMessage()+' '+e.getStackTraceString());
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
            String filter='recordTypeId=\''+RH_Constans.RH_CONTACT_RT+'\'';
            mapReturn.put('Projects',Projects); 
            mapReturn.put('ressourceFilter',filter); 
            mapReturn.put('Picklists',RH_Utility.getPickListOptions(new List<String> {'RH_description_fields__c'},'RH_Invoice_Item__c')); 
            
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
        @AuraEnabled public String subject;
        @AuraEnabled public List<String> descriptionFields;
        @AuraEnabled public Decimal quantity ;
        @AuraEnabled public Decimal rate ;
        @AuraEnabled public String currencyCode ;
        @AuraEnabled public Decimal holiday;
        @AuraEnabled public String Id;
        @AuraEnabled public Date startDate;
        @AuraEnabled public Date endDate;
        public RH_Invoice_Item__c getEntry() {
            List<String> fields =(descriptionFields!= null) ? descriptionFields : new List<String>();
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
                RH_EndDate__c=this.endDate,
                RH_Subject__c=this.subject,
                RH_description_fields__c=String.join(fields,';')
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
            mapReturn.put('DEFAULT_CURRENCY', RH_Constans.DEFAULT_CURRENCY); 
            mapReturn.put('picklists', RH_Utility.getPickListOptions(new List<String> {'RH_Currency_Code__c'},'RH_Invoice__c')); 
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
        @AuraEnabled public String currencyCode ;
        @AuraEnabled public String RHNumber ;
        public RH_Invoice__c getInvoice() {
            return new RH_Invoice__c(
                RH_Account_Id__c=this.AccountId, 
                Id=this.Id, 
                RH_InvoiceDate__c=this.startDate, 
                RH_DueDate__c=this.endDate, 
                RH_Currency_Code__c=this.currencyCode,
                RH_Po__c=this.po,
                RH_Number__c=this.RHNumber
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
        @AuraEnabled public String Cap;
        @AuraEnabled public String City;
        @AuraEnabled public String Sdi;
        @AuraEnabled public String Email;
        @AuraEnabled public Double Civico;
        public Account getAccount() {
            return new Account(
                Name=this.Name, 
                Phone=this.Phone, 
                RH_Cap__c=this.Cap,
                RH_Citta__c=this.City,
                RH_SDI__c=this.Sdi,
                RH_Email__c=this.Email,
                RH_NumeroCivico__c=this.Civico,
                
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