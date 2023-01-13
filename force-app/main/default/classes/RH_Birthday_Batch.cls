public class RH_Birthday_Batch implements Schedulable, Database.Batchable<sObject>, Database.AllowsCallouts,Database.Stateful, RH_telegramMessageConfigInterface {
    
    public void execute(SchedulableContext SC) {

    }
    public void doJob(){
        String recordTypeId=RH_Constans.RH_CONTACT_RT;
        for (Contact con : [SELECT Name,Birthdate,RH_Started_Date__c,RH_User__c FROM Contact WHERE recordTypeId=:recordTypeId AND RH_User__c != NULL AND RH_tgUserId__c != NULL AND RH_Status__c='Active']){
            System.debug('con ' + con);
            if (isThisDay(con.Birthdate)) {
                user_birthday_ids.add(con.RH_User__c);
            }
            if (isThisDay(con.RH_Started_Date__c)) {
                user_workday_ids.add(con.RH_User__c);
            }
        }
        if (! user_birthday_ids.isEmpty()) {
            RH_telegramMessageConfigImpl.notifyTelegramAsync(BIRTHDAY_ACTION,null,user_birthday_ids)  ; 
        }
        if (! user_workday_ids.isEmpty()) {
            RH_telegramMessageConfigImpl.notifyTelegramAsync(WORKDAY_BIRTHDAY_ACTION,null,user_workday_ids)  ; 
        }
    }
    
   

    public RH_Birthday_Batch() {
    }
    List<String> user_birthday_ids = new List<String>();
    List<String> user_workday_ids = new List<String>();
    private static final String BIRTHDAY_ACTION =RH_Constans.PERSONAL_BIRTHDAY_ACTION;
    private static final String WORKDAY_BIRTHDAY_ACTION = RH_Constans.WORK_BIRTHDAY_ACTION;
    private static final String AGE_TOKEN = '[[!Age]]';
    private static final String WORK_AGE_TOKEN = '[[!Work_Age]]';

    public Database.QueryLocator start(Database.BatchableContext BC) {
        String recordTypeId=RH_Constans.RH_CONTACT_RT;
        return Database.getQueryLocator('SELECT Name,Birthdate,RH_Started_Date__c,RH_User__c FROM Contact WHERE recordTypeId=:recordTypeId AND RH_User__c != NULL AND RH_tgUserId__c != NULL AND RH_Status__c=\'Active\'');
    }

    public void execute(Database.BatchableContext BC, List<Contact> Contacts) {
        for (Contact con : Contacts){
            System.debug('con ' + con);
            if (isThisDay(con.Birthdate)) {
                user_birthday_ids.add(con.RH_User__c);
            }
            if (isThisDay(con.RH_Started_Date__c)) {
                user_workday_ids.add(con.RH_User__c);
            }
        }
        
        

    }
    

    public void finish(Database.BatchableContext BC) {
        System.debug('user_birthday_ids >> ' + user_birthday_ids);
        System.debug('user_workday_ids >> ' + user_workday_ids);
        if (! user_birthday_ids.isEmpty()) {
            RH_telegramMessageConfigImpl.notifyTelegramAsync(BIRTHDAY_ACTION,null,user_birthday_ids)  ; 
        }
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
        switch on action {
            when 'TG_BIRTHDAY' {
                mappings.put(AGE_TOKEN, formatYearBetween(receiver?.Birthdate) );
            }
            when 'TG_WORK_BIRTHDAY' {
                mappings.put(WORK_AGE_TOKEN,formatYearBetween(receiver?.RH_Started_Date__c) );
            }
            when else {
            
            }
        }
        Date firstDate = Date.today();
        Date secondDate = receiver.Birthdate;
        Integer monthsBetween = firstDate.monthsBetween(secondDate);
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
    Boolean isThisDay(Date dt) {
        Date td= system.today();
        if (dt == Null ) { return false; }
        if (dt > td ) { return false; }
        return (td.day()==dt.day() && td.month()==dt.month());
    }
    Integer yearBetween(Date dt) {
        Date td= system.today();
        if (dt == Null ) { return 0; }
        if (dt <= td ) { return 0; }
        Decimal years=dt.monthsBetween(td) / 12;
        return years.intValue(); 
    }
    String formatYearBetween(Date dt){
        Integer y=yearBetween( dt);
        return String.valueOf(y);
    }
    /*
    RH_Birthday_Batch batch = new RH_Birthday_Batch();
    Database.executeBatch(batch , 100);
    */
    
}
