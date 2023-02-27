public class RH_Job_Birthday_Batch implements Schedulable, Database.Batchable<sObject>, Database.AllowsCallouts,Database.Stateful, RH_telegramMessageConfigInterface {
    
    public void execute(SchedulableContext SC) {
        RH_Job_Birthday_Batch batch = new RH_Job_Birthday_Batch();
        Database.executeBatch(batch , 100);
    }
    public static void run() {
        RH_Job_Birthday_Batch bsch = new RH_Job_Birthday_Batch();
        String sch = '0 5 10 * * ?';//Class runs every day at 10 AM GMT.
        String jobID = System.schedule('Work Anniversary Job_'+System.now().getTime(), sch, bsch);
    }
    
    
   

    public RH_Job_Birthday_Batch() {
    }
    List<String> user_workday_ids = new List<String>();
    private static final String WORKDAY_BIRTHDAY_ACTION = RH_Constans.WORK_BIRTHDAY_ACTION;
    private static final String WORK_AGE_TOKEN = '[[!Work_Age]]';

    public Database.QueryLocator start(Database.BatchableContext BC) {
        String recordTypeId=RH_Constans.RH_CONTACT_RT;
        return Database.getQueryLocator('SELECT Name,Birthdate,RH_Started_Date__c,RH_User__c FROM Contact WHERE recordTypeId=:recordTypeId AND RH_User__c != NULL AND RH_tgUserId__c != NULL AND RH_Status__c=\'Active\'');
    }

    public void execute(Database.BatchableContext BC, List<Contact> Contacts) {
        for (Contact con : Contacts){
            System.debug('con ' + con);
            if(RH_Birthday_Batch.isThisDay(con.RH_Started_Date__c)) {
                user_workday_ids.add(con.RH_User__c);
            }
        }
        
        

    }
    

    public void finish(Database.BatchableContext BC) {
        System.debug('user_workday_ids >> ' + user_workday_ids);
        
        if (! user_workday_ids.isEmpty()) {
            RH_telegramMessageConfigImpl.notifyTelegramAsync(WORKDAY_BIRTHDAY_ACTION,null,user_workday_ids)  ; 
        }
    }

     // Interface Implementation --- START
     public Map<String,String> buildMapping(Object o){
        Map<String,Object> inputs = (Map<String,Object>) o;
        Map<String,String> mappings = (Map<String,String>) inputs.get('mappings');
        Contact receiver = (Contact) inputs.get('receiver');
        String action = String.valueOf(inputs.get('action'));
        mappings.put(WORK_AGE_TOKEN,RH_Birthday_Batch.formatYearBetween(receiver?.RH_Started_Date__c) );
        return mappings;
    }
    public Object buildMessage(Object o){
        Map<String,Object> inputs= (Map<String,Object>) o;
        RH_Telegram_Utility.Message tg_message=(RH_Telegram_Utility.Message) inputs.get('message');
        String action = String.valueOf(inputs.get('action'));
        System.debug('action >> ' + action);
        return tg_message;
    }
    // Interface Implementation --- END
    
    
}