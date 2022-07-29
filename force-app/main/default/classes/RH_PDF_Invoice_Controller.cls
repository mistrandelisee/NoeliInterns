public without sharing class RH_PDF_Invoice_Controller {
    private static RH_Invoice_Query invoiceQry = RH_Invoice_Query.getInstance();
    public HeaderWrapDatas getHeaderSettingvalue{get;set;}
    public AccountWrapDatas getAccountObjectvalue{get;set;}
    public footerWrapDatas getFooterSettingvalue {get;set;}
    public HeaderInvoiceWrapDatas getHeaderInvoiceObjectvalue {get;set;}
    public List<HeaderInvoiceItemWrapDatas> getHeaderInvoiceItemObjectvalue {get;set;}

    public List<RH_Invoice_Item__c> invoiceItem{get;set;}
    public Account accountItem{get;set;}
    public RH_Invoice__c invoiceList{get;set;}
    public List<RH_Invoice_Item__c> getNumLine{get;set;}
    public List<string> tab{get;set;}
    public List<invoiceWrapDatas> invoiceItemBlock{get;set;}
    public Boolean onePage {get;set;}
    public Boolean multipage {get;set;}



    
    public RH_PDF_Invoice_Controller() {
        string recordId = ApexPages.currentPage().getParameters().get('key'); 
        this.multipage =false;
        this.onePage =false;
       // string recordId ='a020900000BMVW7AAP';
       // string recordId ='a0209000009LKCxAAO';
        System.debug(' @@record id'+recordId);
        generatpageHeader__mdt getHeaderSettingvalue =[Select CompanyId__c,CompanyName__c,Phone__c,Place__c,PoBox__c,TaxId__c from generatpageHeader__mdt];
        this.getHeaderSettingvalue =buildHeader(getHeaderSettingvalue);
        System.debug('RH_PDF_Invoice_Controller  getHeaderSettingvalue: '+getHeaderSettingvalue);
        InvoiceFooter__mdt footer =[Select Acct_No_with_UBA__c,Bank_Adress__c,Bank_Name__c,Beneficiary_Address__c,Beneficiary_Name__c,Branch_Name__c,IBAN__c,Swift_code__c from InvoiceFooter__mdt Limit 1];
        this.getFooterSettingvalue =buildFooter(footer);

        
        //  System.debug('RH_PDF_Invoice_Controller getFooterSettingvalue: '+getFooterSettingvalue);
        //retrive invoice datas
        //BEST PRACTICES
        List<RH_Invoice__c> Invoices = invoiceQry.getInvoice(recordId);
        if (Invoices.isEmpty()) {
            throw new RH_ControllerException('002','No Invoice founded with this ID'+recordId);
        }
        RH_Invoice__c inv=Invoices[0];
        // RH_Invoice__c inv = [SELECT id,RH_Account_Id__c,RH_InvoiceDate__c,RH_Po__c,RH_DueDate__c,Name,RH_Name__c,RH_InvoiceItem_Sum__c,(SELECT Id,RH_Amount__c,RH_Ressource__r.Name,Name,RH_ProjectId__r.Name,RH_StartDate__c,RH_EndDate__c,
        // RH_Holiday__c,RH_Quantity__c,RH_Rate__c,RH_InvoiceId__c,RH_Currency_Symbol__c  FROM  RH_Invoices_Items__r) FROM RH_Invoice__c WHERE id =: recordId ];
        this.getHeaderInvoiceObjectvalue = buildInvoice(inv);
        this.getHeaderInvoiceItemObjectvalue = buildInvoiceItem(inv);
        
         System.debug('RH_PDF_Invoice_Controller  inv: '+inv);
            System.debug(inv.id);
            Account acc = [SELECT id,RH_Via__c,RH_NumeroCivico__c,RH_Cap__c,RH_Citta__c,RH_Regione__c,Phone,RH_Email__c,RH_Piva__c,RH_SDI__c,Name FROM account WHERE Id =: inv.RH_Account_Id__c ];
            this.getAccountObjectvalue =buildAccount(acc);
        System.debug('RH_PDF_Invoice_Controller  acc: '+acc);
            List<RH_Invoice_Item__c> fp =new List<RH_Invoice_Item__c>();
            Boolean isFistpage =true;
            invoiceItemBlock = new List<invoiceWrapDatas>();
            RH_Invoice_Item__c[] ItemList = inv.RH_Invoices_Items__r;
            System.debug(' @@total size '+ItemList.size());
            System.debug(' @@records '+ItemList);

            // check if is one page
            if(ItemList.size() > 4){
                List<HeaderInvoiceItemWrapDatas> invoiceItemList =New List<HeaderInvoiceItemWrapDatas>();
                multipage =true;
                integer totalSize = ItemList.size();
                // check if is two page
                if(totalSize <= 30){
                    if(totalSize < 7){
                        for(integer i=0; i<=totalSize-1;i++){
                            invoiceItemList.add(this.getHeaderInvoiceItemObjectvalue[i]);
                    	}
                        System.debug(ItemList);
                   		invoiceItemBlock.add(new invoiceWrapDatas(true,invoiceItemList,false));
                        invoiceItemBlock.add(new invoiceWrapDatas(false, New List<HeaderInvoiceItemWrapDatas>{},true));
                   }
                   else{
                        for(integer i=0; i<=6;i++){
                            invoiceItemList.add(this.getHeaderInvoiceItemObjectvalue[i]);
                        }
                        System.debug(invoiceItemList);
                        System.debug(ItemList);
                        invoiceItemBlock.add(new invoiceWrapDatas(true,invoiceItemList,false)); 
                        System.debug(invoiceItemBlock);
                        invoiceItemList= new List<HeaderInvoiceItemWrapDatas>{};
                        if(ItemList.size()<19){
                            for(integer i=7; i<=ItemList.size()-1;i++){
                                invoiceItemList.add(this.getHeaderInvoiceItemObjectvalue[i]);
                            }
                            invoiceItemBlock.add(new invoiceWrapDatas(false,invoiceItemList,true));
                        } 
                        else {
                            for(integer i=7; i<=18;i++){
                                invoiceItemList.add(this.getHeaderInvoiceItemObjectvalue[i]);
                            }

                            invoiceItemBlock.add(new invoiceWrapDatas(false,invoiceItemList,false));
                            invoiceItemList= new List<HeaderInvoiceItemWrapDatas>{};
                            for(integer i=19; i<=ItemList.size()-1;i++){
                                invoiceItemList.add(this.getHeaderInvoiceItemObjectvalue[i]);
                            }
                            if (ItemList.size()<27) {
                            invoiceItemBlock.add(new invoiceWrapDatas(false,  invoiceItemList,true));
                            }else {
                                invoiceItemBlock.add(new invoiceWrapDatas(false,  invoiceItemList,false));
                                invoiceItemBlock.add(new invoiceWrapDatas(false, New List<HeaderInvoiceItemWrapDatas>{},true));
                            }
                        } 
                    }
                }else{
                    for(integer i=0; i<=6;i++){
                        invoiceItemList.add(this.getHeaderInvoiceItemObjectvalue.remove(i));
                    }
                    invoiceItemBlock.add(new invoiceWrapDatas(true,invoiceItemList,false)); 
                    invoiceItemList= new List<HeaderInvoiceItemWrapDatas>{};
                    for(integer i=0; i<=11;i++){
                        invoiceItemList.add(this.getHeaderInvoiceItemObjectvalue[i]);
                    }
                    invoiceItemBlock.add(new invoiceWrapDatas(false,invoiceItemList,false));
                    invoiceItemList= new List<HeaderInvoiceItemWrapDatas>{};
                    if (getHeaderInvoiceItemObjectvalue.size()<24) {
                        for(integer i=12; i<=getHeaderInvoiceItemObjectvalue.size()-1;i++){
                            invoiceItemList.add(this.getHeaderInvoiceItemObjectvalue[i]);
                        }
                        invoiceItemBlock.add(new invoiceWrapDatas(false,invoiceItemList,false));
                        invoiceItemBlock.add(new invoiceWrapDatas(false, New List<HeaderInvoiceItemWrapDatas>{},true));
                        invoiceItemList= new List<HeaderInvoiceItemWrapDatas>{};
                    }else {
                        for(integer i=12; i<=23;i++){
                            invoiceItemList.add(this.getHeaderInvoiceItemObjectvalue[i]);
                        }
                        invoiceItemBlock.add(new invoiceWrapDatas(false,invoiceItemList,false));
                        invoiceItemList= new List<HeaderInvoiceItemWrapDatas>{};
                        if (getHeaderInvoiceItemObjectvalue.size()<32) {
                            for(integer i=24; i<=getHeaderInvoiceItemObjectvalue.size()-1;i++){
                                invoiceItemList.add(this.getHeaderInvoiceItemObjectvalue[i]);
                            }
                            invoiceItemBlock.add(new invoiceWrapDatas(false,  invoiceItemList,true));
                        }else {
                            if (getHeaderInvoiceItemObjectvalue.size()<38) {
                                for(integer i=24; i<=getHeaderInvoiceItemObjectvalue.size()-1;i++){
                                    invoiceItemList.add(this.getHeaderInvoiceItemObjectvalue[i]);
                                }
                                invoiceItemBlock.add(new invoiceWrapDatas(false,invoiceItemList,false));
                                invoiceItemBlock.add(new invoiceWrapDatas(false, New List<HeaderInvoiceItemWrapDatas>{},true));
                            }else {
                                for(integer i=24; i<=37;i++){
                                    invoiceItemList.add(this.getHeaderInvoiceItemObjectvalue[i]);
                                }
                                invoiceItemBlock.add(new invoiceWrapDatas(false,invoiceItemList,false));
                                invoiceItemList= new List<HeaderInvoiceItemWrapDatas>{};
                                for(integer i=38; i<=getHeaderInvoiceItemObjectvalue.size()-1;i++){
                                    invoiceItemList.add(this.getHeaderInvoiceItemObjectvalue[i]);
                                }
                                invoiceItemBlock.add(new invoiceWrapDatas(false,invoiceItemList,false));
                                invoiceItemBlock.add(new invoiceWrapDatas(false, New List<HeaderInvoiceItemWrapDatas>{},true));
                                invoiceItemList= new List<HeaderInvoiceItemWrapDatas>{};
                            }
                            
                        }
                    }
                }

            }else{
                invoiceItemBlock.add(new invoiceWrapDatas(true,this.getHeaderInvoiceItemObjectvalue,true));
                onePage =true;
            }

          
          
            List<String> tab1=new list<string>();
             tab1.add('dfdff');
             tab1.add('dfdff');
             tab =tab1;

        invoiceItem = inv.RH_Invoices_Items__r;
        accountItem = acc;
        invoiceList = inv;
      
    
    }

    public static HeaderWrapDatas buildHeader(generatpageHeader__mdt getHeaderSettingvalue){
        HeaderWrapDatas response = new HeaderWrapDatas();
        response.CompanyId=getHeaderSettingvalue?.CompanyId__c;
        response.CompanyName=getHeaderSettingvalue?.CompanyName__c;
        response.Phone=getHeaderSettingvalue?.Phone__c;
        response.Place=getHeaderSettingvalue?.Place__c;
        response.PoBox=getHeaderSettingvalue?.PoBox__c;
        response.TaxId=getHeaderSettingvalue?.TaxId__c;

        return response;

    } 

    
    public static HeaderInvoiceWrapDatas buildInvoice(RH_Invoice__c getHeaderInvoiceObjectvalue){
        HeaderInvoiceWrapDatas respon = new HeaderInvoiceWrapDatas();
        respon.RHAccountId=getHeaderInvoiceObjectvalue?.RH_Account_Id__c;
        respon.RHInvoiceDate=getHeaderInvoiceObjectvalue?.RH_InvoiceDate__c;
        respon.RHPo=getHeaderInvoiceObjectvalue?.RH_Po__c;
        respon.RHDueDate=getHeaderInvoiceObjectvalue?.RH_DueDate__c;
        respon.Name=getHeaderInvoiceObjectvalue?.Name;
        respon.RHName=getHeaderInvoiceObjectvalue?.RH_Name__c;
        respon.RHInvoiceItemSum=getHeaderInvoiceObjectvalue?.RH_InvoiceItem_Sum__c;
        
        return respon;

    } 

    public static List<HeaderInvoiceItemWrapDatas> buildInvoiceItem(RH_Invoice__c getHeaderInvoiceItemObjectvalue){
         List<RH_Invoice_Item__c> ListItem = new List<RH_Invoice_Item__c>();
         ListItem = getHeaderInvoiceItemObjectvalue.RH_Invoices_Items__r;
        List<HeaderInvoiceItemWrapDatas> ListResponse = new List<HeaderInvoiceItemWrapDatas>();
        for(RH_Invoice_Item__c cc:ListItem){
            HeaderInvoiceItemWrapDatas response = new HeaderInvoiceItemWrapDatas();
            response.RHAmount=cc?.RH_Amount__c;
            // response.RHProjectIdName=cc?.RH_ProjectId__r.Name;
            response.RHProjectIdName=cc?.RH_Title__c;
            response.RHStartDate=cc?.RH_StartDate__c;
            response.RHEndDate=cc?.RH_EndDate__c;
            response.RHHoliday=cc?.RH_Holiday__c;
            response.RHQuantity=cc?.RH_Quantity__c;
            response.RHRate=cc?.RH_Rate__c;
            response.Name=cc?.Name;
            response.RHRessource=cc?.RH_Ressource__r.Name;
            response.RHCurrencySymbol=cc?.RH_Currency_Symbol__c;

            ListResponse.add(response);
        }
        
        return ListResponse;

    }

    public static AccountWrapDatas buildAccount(Account getAccountObjectvalue){
        AccountWrapDatas response = new AccountWrapDatas();
        response.RHVia=getAccountObjectvalue?.RH_Via__c;
        response.RHNumeroCivico=getAccountObjectvalue?.RH_NumeroCivico__c;
        response.RHCap=getAccountObjectvalue?.RH_Cap__c;
        response.RHCitta=getAccountObjectvalue?.RH_Citta__c;
        response.RHRegione=getAccountObjectvalue?.RH_Regione__c;
        response.Phone=getAccountObjectvalue?.Phone;
        response.RHEmail=getAccountObjectvalue?.RH_Email__c;
        response.RHPiva=getAccountObjectvalue?.RH_Piva__c;
        response.RHSDI=getAccountObjectvalue?.RH_SDI__c;
        response.Name=getAccountObjectvalue?.Name;

        return response;

    }

    public static footerWrapDatas buildFooter( InvoiceFooter__mdt footer){
        footerWrapDatas response = new footerWrapDatas();
        response.AccountNum=footer?.Acct_No_with_UBA__c;
        response.BankAdress=footer?.Bank_Adress__c;
        response.BankName=footer?.Bank_Name__c;
        response.BeneficiaryAddress=footer?.Beneficiary_Address__c;
        response.BeneficiaryName=footer?.Beneficiary_Name__c;
        response.BranchName=footer?.Branch_Name__c;
        response.IBAN=footer?.IBAN__c;
        response.SwiftCode=footer?.Swift_code__c;

        return response;

    }

    public class invoiceWrapDatas{
        public Boolean page{get;set;}
        public Boolean showFt{get;set;}
        public List<HeaderInvoiceItemWrapDatas> invoiceItem{get;set;}

        public invoiceWrapDatas( Boolean page,List<HeaderInvoiceItemWrapDatas> invoiceItem,Boolean showFt){
            this.page = page;
            this.invoiceItem =invoiceItem;
            this.showFt =showFt;
        }

     }

     public class footerWrapDatas{
        //footer 
        public Decimal AccountNum{get;set;}
        public String BankAdress{get;set;}
        public String BankName{get;set;}
        public String BeneficiaryAddress{get;set;}
        public String BeneficiaryName{get;set;}
        public String BranchName{get;set;}
        public String IBAN{get;set;}
        public String SwiftCode{get;set;}
     }

    public class HeaderWrapDatas{
        //getHeaderSettingvalue
        public String CompanyId{get;set;}
        public String CompanyName{get;set;}
        public String Phone{get;set;}
        public String Place{get;set;}
        public String PoBox{get;set;}
        public String TaxId{get;set;}
    }
        
    public class AccountWrapDatas{
        //getAccountObjectvalue
        public String RHVia{get;set;}
        public Decimal RHNumeroCivico{get;set;}
        public String RHCap{get;set;}
        public String RHCitta{get;set;}
        public String RHRegione{get;set;}
        public String Phone{get;set;}
        public String RHEmail{get;set;}
        public String RHPiva{get;set;}
        public String RHSDI{get;set;}
        public String Name{get;set;}
    }

    public class HeaderInvoiceWrapDatas{
        //Invoice
        public String RHAccountId{get;set;}
        public Date RHInvoiceDate{get;set;}
        public String RHPo{get;set;}
        public Date RHDueDate{get;set;}
        public String Name{get;set;}
        public String RHName{get;set;}
        public Decimal RHInvoiceItemSum{get;set;}
    }

    public class HeaderInvoiceItemWrapDatas{
        //Invoice
        public Decimal RHAmount{get;set;} 
        public String RHProjectIdName{get;set;}
        public Date RHStartDate{get;set;}
        public Date RHEndDate{get;set;}
        public Decimal RHHoliday{get;set;}
        public Decimal RHQuantity{get;set;}
        public Decimal RHRate{get;set;}
        public String Name{get;set;}
        public String RHRessource{get;set;}
        public String RHCurrencySymbol{get;set;}
        //public String RHInvoiceId{get;set;}
    }

}