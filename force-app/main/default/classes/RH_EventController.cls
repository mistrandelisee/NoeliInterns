public with sharing class RH_EventController {
    @AuraEnabled
    public static List<Event__c> getMyEvent() {
        List<Event__c> evenList = [SELECT id,Name,Contact_Id__r.Name,Description__c, Start_Date__c, Status__c FROM Event__c];
        System.debug('event-->' + evenList);
        return evenList;
    }
    
    @AuraEnabled
    public static void saveEvent(String objEven) {
        system.debug('@@@@EventDatas' + objEven);
        // try{
            wrapperData datas = (wrapperData)JSON.deserialize(objEven, wrapperData.class);
            User u = [Select Id, RH_ContactId__c From User where Username = 'elisee_test_ceo.dev@aro.it'];
            String conId = u.RH_ContactId__c;
                Event__c even = new Event__c(
                    Name = datas.Name,
                    Contact_Id__c = conId,
                    Description__c  = datas.Description,
                    Start_Date__c =dateToParse(datas.StartDate)
                    // Status__c =datas.Status

                );
                upsert even;
                system.debug('@@@@EventDatas' + even);
        // }
        // catch(Exception ex) {
        //     throw new AuraHandledException(ex.getMessage());
        // }
    }

    public class wrapperData{
        public String Name { get; set; }
        public String Description { get; set; }
        public String StartDate { get; set; }
        // public String Status { get; set; }
    }

    @AuraEnabled
    public static List<SelectOptionObj> getPicklistStatus() {
        List<SelectOptionObj> picklistOptions = new List<SelectOptionObj>();
        try {
            Schema.DescribeFieldResult fieldResult = Event__c.Status__c.getDescribe();
            List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
            SelectOptionObj option = null;
            for (Schema.PicklistEntry pickListVal : ple) {
                option = new SelectOptionObj(pickListVal.getLabel(), pickListVal.getValue(), pickListVal.isDefaultValue());
                picklistOptions.add(option);
            }
            
        } catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
        system.debug('--->'+picklistOptions);
        return picklistOptions;
    }
    public class SelectOptionObj {
        @AuraEnabled
        public String label { get; set; }
        @AuraEnabled
        public String value { get; set; }
        @AuraEnabled
        public Boolean isDefault {get; set;}
        
        public SelectOptionObj(String label, String val,Boolean isDefault) {
            this.label = label;
            this.value = val;
            this.isDefault = isDefault;
        }
    }

    //convert string date to date 
    public static Date dateToParse(String dateOCS){
        System.debug('OCSRecuperaDatiPostvenditaController dateToParse input: '+dateOCS);
        Date res = null; 
        try{
            if(dateOCS != '0' && dateOCS != null)
            { 
                if(dateOCS.contains('/')){ 
                    res =  Date.parse(dateOCS);
                }
                else if(dateOCS.contains('-')){
                System.debug('anno' + Integer.valueOf(dateOCS.substring(0, 4)) + ' mese' + Integer.valueOf(dateOCS.substring(5,7)) + 'Giorno ' + Integer.valueOf(dateOCS.substring(8,10))); 
                    res = Date.newInstance(Integer.valueOf(dateOCS.substring(0, 4)), 
                            Integer.valueOf(dateOCS.substring(5,7)),
                            Integer.valueOf(dateOCS.substring(8,10)));
                }
                else{ 
                    res =  Date.newInstance(Integer.valueOf(dateOCS.substring(0, 4)), 
                            Integer.valueOf(dateOCS.substring(4,6)),
                            Integer.valueOf(dateOCS.substring(6)));
                }
            }   
            else
                res = null;
        }
        catch(Exception e){
            System.debug('AccountUtils dateToParse Exception, message: '+e.getCause()+'\n'+e.getStackTraceString());
        }
        return res;
    }
}