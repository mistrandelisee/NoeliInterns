public without sharing class invoiceManagerVfpController {
    public HeaderWrapDatas getHeaderSettingvalue{get;set;}
    public AccountWrapDatas getAccountObjectvalue{get;set;}
    public footerWrapDatas getFooterSettingvalue {get;set;}
    public List<HeaderInvoiceWrapDatas> getHeaderInvoiceObjectvalue {get;set;}

    public List<RH_Invoice_Item__c> invoiceItem{get;set;}
    public Account accountItem{get;set;}
    public RH_Invoice__c invoiceList{get;set;}
    public List<RH_Invoice_Item__c> getNumLine{get;set;}
    public List<string> tab{get;set;}
    public List<invoiceWrapDatas> invoiceItemBlock{get;set;}
    public Boolean onePage {get;set;}
    public Boolean multipage {get;set;}



    
    public invoiceManagerVfpController() {
        string recordId = ApexPages.currentPage().getParameters().get('key'); 
        this.multipage =false;
        this.onePage =false;
       // string recordId ='a020900000BMVW7AAP';
       // string recordId ='a0209000009LKCxAAO';
        System.debug(' @@record id'+recordId);
        generatpageHeader__mdt getHeaderSettingvalue =[Select CompanyId__c,CompanyName__c,Phone__c,Place__c,PoBox__c,TaxId__c from generatpageHeader__mdt];
        this.getHeaderSettingvalue =buildHeader(getHeaderSettingvalue);
        System.debug('invoiceManagerVfpController  getHeaderSettingvalue: '+getHeaderSettingvalue);
        InvoiceFooter__mdt footer =[Select Acct_No_with_UBA__c,Bank_Adress__c,Bank_Name__c,Beneficiary_Address__c,Beneficiary_Name__c,Branch_Name__c,IBAN__c,Swift_code__c from InvoiceFooter__mdt Limit 1];
        this.getFooterSettingvalue =buildFooter(footer);

        
         System.debug('invoiceManagerVfpController getFooterSettingvalue: '+getFooterSettingvalue);
        //retrive invoice datas
        RH_Invoice__c inv = [SELECT id,RH_Account_Id__c,RH_InvoiceDate__c,RH_Po__c,RH_DueDate__c,Name,RH_Name__c,RH_InvoiceItem_Sum__c,(SELECT Id,RH_Amount__c,RH_ProjectId__r.Description__c,RH_StartDate__c,RH_EndDate__c,
        RH_Holiday__c,RH_Quantity__c,RH_Rate__c,RH_InvoiceId__c  FROM  RH_Invoices_Items__r) FROM RH_Invoice__c WHERE id =: recordId ];
        this.getHeaderInvoiceObjectvalue = buildInvoice(inv);
        
         System.debug('invoiceManagerVfpController  inv: '+inv);
            System.debug(inv.id);
            Account acc = [SELECT id,RH_Via__c,RH_NumeroCivico__c,RH_Cap__c,RH_Citta__c,RH_Regione__c,RH_Telefono__c,RH_Email__c,RH_Piva__c,RH_SDI__c,Name FROM account WHERE Id =: inv.RH_Account_Id__c ];
            this.getAccountObjectvalue =buildAccount(acc);
        System.debug('invoiceManagerVfpController  acc: '+acc);
            List<RH_Invoice_Item__c> fp =new List<RH_Invoice_Item__c>();
            Boolean isFistpage =true;
            invoiceItemBlock = new List<invoiceWrapDatas>();
            RH_Invoice_Item__c[] ItemList = inv.RH_Invoices_Items__r;
            System.debug(' @@total size '+ItemList.size());
            System.debug(' @@records '+ItemList);

            // check if is one page
            if(ItemList.size() > 4){
               List<RH_Invoice_Item__c> invoiceItemList =New List<RH_Invoice_Item__c>();
               multipage =true;
               integer totalSize = ItemList.size();
            // check if is two page
               if(totalSize <= 30){
                   if(totalSize < 10){
                        for(integer i=0; i<=totalSize-1;i++){
                        	invoiceItemList.add(ItemList[i]);
                    	}
                         System.debug(ItemList);
                   		 invoiceItemBlock.add(new invoiceWrapDatas(true,invoiceItemList,false));
                         invoiceItemBlock.add(new invoiceWrapDatas(false, New List<RH_Invoice_Item__c>{},true));
                   }else{
                        for(integer i=0; i<=10;i++){
                        invoiceItemList.add(ItemList[i]);
                        }
                        System.debug(invoiceItemList);
                        System.debug(ItemList);
                            invoiceItemBlock.add(new invoiceWrapDatas(true,invoiceItemList,false)); 
                            System.debug(invoiceItemBlock);
                            invoiceItemList= new List<RH_Invoice_Item__c>{};
                            for(integer i=11; i<=ItemList.size()-1;i++){
                                invoiceItemList.add(ItemList[i]);
                            }   
                            if(ItemList.size()<29){
                                invoiceItemBlock.add(new invoiceWrapDatas(false,invoiceItemList,true));
                            } 
                            else {
                                invoiceItemBlock.add(new invoiceWrapDatas(false,invoiceItemList,false));
                                invoiceItemBlock.add(new invoiceWrapDatas(false, New List<RH_Invoice_Item__c>{},true));
                            }       
                           
                        }
                   
                }else{

                    for(integer i=0; i<=11;i++){
                        invoiceItemList.add(ItemList.remove(i));
                    }
                    invoiceItemBlock.add(new invoiceWrapDatas(true,invoiceItemList,false)); 
                    invoiceItemList= new List<RH_Invoice_Item__c>{};
                    //integer numberOfPage = math.mod(totalSize, 22) != null? (totalSize / 22)+1 : totalSize / 22;

                        for(integer j=0; j<=ItemList.size()-1;j++){
                           if(invoiceItemList.size() < 22 ){
                                invoiceItemList.add(ItemList[j]);
                           }else{
                               if(j == ItemList.size()-1){
                                    invoiceItemBlock.add(new invoiceWrapDatas(false,invoiceItemList,false)); 
                                    invoiceItemBlock.add(new invoiceWrapDatas(false, New List<RH_Invoice_Item__c>{},true));
                                    invoiceItemList= new List<RH_Invoice_Item__c>{};
                                    system.debug('la derniere page');
                               }else{
                                    invoiceItemBlock.add(new invoiceWrapDatas(false,invoiceItemList,false)); 
                                    invoiceItemList= new List<RH_Invoice_Item__c>{};
                               }
                           
                           }
                        //    if last loop and item < 22 add in the last page
                           if(j == ItemList.size()-1 && invoiceItemList.size() > 0 ){
                            invoiceItemBlock.add(new invoiceWrapDatas(false,invoiceItemList,false));
                            invoiceItemBlock.add(new invoiceWrapDatas(false, New List<RH_Invoice_Item__c>{},true)); 
                            invoiceItemList= new List<RH_Invoice_Item__c>{};
                            system.debug('la derniere page');
                           }


                        }
                    

                }

            }else{
                invoiceItemBlock.add(new invoiceWrapDatas(true,inv.RH_Invoices_Items__r,true));
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

    
    public static List<HeaderInvoiceWrapDatas> buildInvoice(RH_Invoice__c getHeaderInvoiceObjectvalue){
        List<RH_Invoice_Item__c> ListItem = new List<RH_Invoice_Item__c>();
        ListItem = getHeaderInvoiceObjectvalue.RH_Invoices_Items__r;
        List<HeaderInvoiceWrapDatas> ListResponse = new List<HeaderInvoiceWrapDatas>();
        for(RH_Invoice_Item__c cc:ListItem){
            HeaderInvoiceWrapDatas response = new HeaderInvoiceWrapDatas();
            response.RHAccountId=getHeaderInvoiceObjectvalue?.RH_Account_Id__c;
            response.RHInvoiceDate=getHeaderInvoiceObjectvalue?.RH_InvoiceDate__c;
            response.RHPo=getHeaderInvoiceObjectvalue?.RH_Po__c;
            response.RHDueDate=getHeaderInvoiceObjectvalue?.RH_DueDate__c;
            response.Name=getHeaderInvoiceObjectvalue?.Name;
            response.RHName=getHeaderInvoiceObjectvalue?.RH_Name__c;
            response.RHInvoiceItemSum=getHeaderInvoiceObjectvalue?.RH_InvoiceItem_Sum__c;
            response.RHAmount=cc?.RH_Amount__c;
            response.RHProjectIdDescription=cc?.RH_ProjectId__r.Description__c;
            response.RHStartDate=cc?.RH_StartDate__c;
            response.RHEndDate=cc?.RH_EndDate__c;
            response.RHHoliday=cc?.RH_Holiday__c;
            response.RHQuantity=cc?.RH_Quantity__c;
            response.RHRate=cc?.RH_Rate__c;

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
        response.RHTelefono=getAccountObjectvalue?.RH_Telefono__c;
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
        public List<RH_Invoice_Item__c> invoiceItem{get;set;}

        public invoiceWrapDatas( Boolean page,List<RH_Invoice_Item__c> invoiceItem,Boolean showFt){
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
        public String RHTelefono{get;set;}
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
        public String RHName{get;set;}
        public Decimal RHInvoiceItemSum{get;set;}
        public Decimal RHAmount{get;set;} 
        public String RHProjectIdDescription{get;set;}
        public Date RHStartDate{get;set;}
        public Date RHEndDate{get;set;}
        public Decimal RHHoliday{get;set;}
        public Decimal RHQuantity{get;set;}
        public Decimal RHRate{get;set;}
        public String Name{get;set;}
    }

}