public without sharing class RH_PDF_Invoice_Controller {
    private static RH_Invoice_Query invoiceQry = RH_Invoice_Query.getInstance();
    public HeaderWrapDatas getHeaderSettingvalue{get;set;}
    public footerWrapDatas getFooterSettingvalue {get;set;}
    public invoiceWrapper invoice{get;set;}
    static final Integer NB_PAGE_SIZE =5;
    static final Integer NB_FISRTPAGE_SIZE =7;
    static final Integer NB_PAGE_SIZE_NO_FOOTER =10;
    static final Integer NB_PAGE_SIZE_NOTHING =15;
    static final Boolean ALWAYS_HEADER =true;
    static final Boolean ALWAYS_FOOTER =false;
    public List<lineBlock> blocks{get;set;}


    
    public RH_PDF_Invoice_Controller() {
        string recordId = ApexPages.currentPage().getParameters().get('key'); 
        System.debug(' @@record id'+recordId);
        generatpageHeader__mdt getHeaderSettingvalue =[Select CompanyId__c,CompanyName__c,Phone__c,Place__c,PoBox__c,TaxId__c from generatpageHeader__mdt];
        this.getHeaderSettingvalue =buildHeader(getHeaderSettingvalue);
        System.debug('RH_PDF_Invoice_Controller  getHeaderSettingvalue: '+getHeaderSettingvalue);
        InvoiceFooter__mdt footer =[Select Acct_No_with_UBA__c,Bank_Adress__c,Bank_Name__c,Beneficiary_Address__c,Beneficiary_Name__c,Branch_Name__c,IBAN__c,Swift_code__c from InvoiceFooter__mdt Limit 1];
        this.getFooterSettingvalue =buildFooter(footer);
        //BEST PRACTICES
        List<RH_Invoice__c> Invoices = invoiceQry.getInvoice(recordId);
        if (Invoices.isEmpty()) {
            throw new RH_ControllerException('002','No Invoice founded with this ID'+recordId);
        }
        RH_Invoice__c inv=Invoices[0];
        buildInvoice(inv);
      
    
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
    public void buildInvoice(RH_Invoice__c inv){
        invoice=new invoiceWrapper(inv.Name, inv.RH_Number__c,inv.RH_Po__c,inv.RH_InvoiceDate__c,inv.RH_DueDate__c,inv.RH_InvoiceItem_Sum__c);
        invoice.setClient(buildClient(inv.RH_Account_Id__r));
        invoice.setBlocks(buildBlockList(inv.RH_Invoices_Items__r));
    }

    public List<lineBlock> buildBlockList(List<RH_Invoice_Item__c> InvoiceItems){
        List<lineBlock> blocks = new List<lineBlock>();
        integer total_size=InvoiceItems.size();
        integer block_number=0;
        integer cnt=1;
        boolean endOfItems=true;//when empty 
        do{
            Boolean isFirst=block_number==0;
            Boolean isLast= cnt==total_size;
            Boolean showHeader=!isFirst && ALWAYS_HEADER;
            Boolean showFooter= isLast || ALWAYS_FOOTER;

            integer block_size=NB_PAGE_SIZE;//with header and footer
            if (isFirst && !showFooter ) { //first page without footer
                block_size=NB_FISRTPAGE_SIZE;
            }
            if (showHeader && !showFooter) {//only with header
                block_size=NB_PAGE_SIZE_NO_FOOTER;
            }
            if (!isFirst && !showHeader && !showFooter) { // other pages without footer and header
                block_size=NB_PAGE_SIZE_NOTHING;
            }
            integer remaining_size=InvoiceItems.size();
            block_size = block_size <= remaining_size ? block_size : remaining_size;

            lineBlock block = new lineBlock(showHeader,new List<lineItem> (),showFooter);

            for (Integer k = 0; k < block_size; k++) {
                block.items.add(
                    buildLine(cnt,InvoiceItems.remove(0))//remove the item from the list, this action decrease the size of the list
                );
                cnt=cnt+1;
            }
            blocks.add(block);
            block_number=block_number+1; 
            endOfItems=(block_size >= remaining_size);
            block.showFooter= block.showFooter || endOfItems;//recaculate show footer
        }while (!endOfItems) ;

        return blocks;
    }
    public static clientWrapper buildClient(Account acc){
        clientWrapper client = new clientWrapper(acc.RH_Via__c,acc.RH_NumeroCivico__c,acc.RH_Cap__c,acc.RH_Citta__c,acc.RH_Regione__c,acc.Phone,acc.RH_Email__c,acc.RH_Piva__c,acc.RH_SDI__c,acc.Name);
        return client;
    }
    public static lineItem buildLine(integer cnt,RH_Invoice_Item__c Item){
        return new lineItem(cnt,item?.RH_Amount__c, item?.RH_Title__c, item?.RH_StartDate__c, item?.RH_EndDate__c,
            item?.RH_Quantity__c, item?.RH_Rate__c, item?.Name, item?.RH_Currency_Symbol__c);
    }
    public class lineBlock{
        public Boolean showHeader{get;set;}
        public Boolean showFooter{get;set;}
        public List<lineItem> items{get;set;}

        public lineBlock( Boolean showHeader,List<lineItem> lineItems,Boolean showFt){
            this.showHeader = showHeader;
            this.items =lineItems;
            this.showFooter =showFt;
        }
    }
    public class lineItem{
        //Invoice
        public Decimal Amount{get;set;} 
        public String Description{get;set;}
        public Date StartDate{get;set;}
        public Date EndDate{get;set;}
        public Decimal Quantity{get;set;}
        public Decimal Rate{get;set;}
        public String Name{get;set;}
        public String CurrencySymbol{get;set;}
        public integer cnt{get;set;}

        
        public lineItem(integer cnt,Decimal Amount,String Description,Date StartDate,Date EndDate,Decimal Quantity,Decimal Rate,String Name,String CurrencySymbol){
            this.cnt=cnt;
            this.Amount=Amount;
            this.Description=Description;
            this.StartDate=StartDate;
            this.EndDate=EndDate;
            this.Quantity=Quantity;
            this.Rate=Rate;
            this.Name=Name;
            this.CurrencySymbol=CurrencySymbol;
        }
        //public String RHInvoiceId{get;set;}
    }
    public class clientWrapper{
        public String Via{get;set;}
        public Decimal NumeroCivico{get;set;}
        public String Cap{get;set;}
        public String Citta{get;set;}
        public String Regione{get;set;}
        public String Phone{get;set;}
        public String Email{get;set;}
        public String Piva{get;set;}
        public String SDI{get;set;}
        public String Name{get;set;}
        public clientWrapper(String Via,Decimal NumeroCivico,String Cap,String Citta,String Regione,String Phone,String Email,String Piva,String SDI,String Name){
            this.Via=Via;
            this.NumeroCivico=NumeroCivico;
            this.Cap=Cap;
            this.Citta=Citta;
            this.Regione=Regione;
            this.Phone=Phone;
            this.Email=Email;
            this.Piva=Piva;
            this.SDI=SDI;
            this.Name=Name;
        }
    }
    public class invoiceWrapper{
        //Invoice
        public String invNumber {get;set;}
        public Date invDate{get;set;}
        public String invPo{get;set;}
        public Date invDueDate{get;set;}
        public String invName{get;set;}
        public String CurrencySymbol{get;set;}
        public Decimal invTotal{get;set;}
        public clientWrapper client{get;set;}
        public List<lineBlock> blocks{get;set;}

        public invoiceWrapper(String invName,String invNumber,String invPo,Date invDate,Date invDueDate,Decimal invTotal){
            this.invNumber=invNumber;
            this.invDate=invDate;
            this.invPo=invPo;
            this.invDueDate=invDueDate;
            this.invName=invName;
            this.invTotal=invTotal;
        }
        public void setBlocks(List<lineBlock> blocks){
            this.blocks=blocks;
            if (!blocks.isEmpty() && !blocks[0].items.isEmpty()) {
                this.CurrencySymbol=blocks[0].items[0].CurrencySymbol;
            }
        }
        public void setClient(clientWrapper client){
            this.client=client;
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
    

}