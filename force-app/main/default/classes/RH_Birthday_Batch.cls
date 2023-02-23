public class RH_Birthday_Batch implements Schedulable, Database.Batchable<sObject>, Database.AllowsCallouts,Database.Stateful, RH_telegramMessageConfigInterface {
    
    public void execute(SchedulableContext SC) {
        RH_Birthday_Batch batch = new RH_Birthday_Batch();
        Database.executeBatch(batch , 100);
    }
    public static void run() {
        RH_Birthday_Batch bsch = new RH_Birthday_Batch();
        String sch = '0 5 10 * * ?';//Class runs every day at 10 AM GMT.
        String jobID = System.schedule('Birth Anniversary Job_'+System.now().getTime(), sch, bsch);
    }

    public RH_Birthday_Batch() {
    }
    List<String> user_birthday_ids = new List<String>();
    private static final String BIRTHDAY_ACTION =RH_Constans.PERSONAL_BIRTHDAY_ACTION;
    private static final String AGE_TOKEN = '[[!Age]]';

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
        }
        
        

    }
    

    public void finish(Database.BatchableContext BC) {
        System.debug('user_birthday_ids >> ' + user_birthday_ids);
        if (! user_birthday_ids.isEmpty()) {
            RH_telegramMessageConfigImpl.notifyTelegramAsync(BIRTHDAY_ACTION,null,user_birthday_ids)  ; 
        }
    }

     // Interface Implementation --- START
     public Map<String,String> buildMapping(Object o){
        Map<String,Object> inputs = (Map<String,Object>) o;
        Map<String,String> mappings = (Map<String,String>) inputs.get('mappings');
        Contact receiver = (Contact) inputs.get('receiver');
        String action = String.valueOf(inputs.get('action'));
        mappings.put(AGE_TOKEN, formatYearBetween(receiver?.Birthdate) );
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
    public static Boolean  isThisDay(Date dt) {
        Date td= system.today();
        if (dt == Null ) { return false; }
        if (dt >= td ) { return false; }
        return (td.day()==dt.day() && td.month()==dt.month());
    }
    public static Integer yearBetween(Date dt) {
        Date td= system.today();
        if (dt == Null ) { return 0; }
        if (dt >= td ) { return 0; }
        Decimal years=dt.monthsBetween(td) / 12;
        return years.intValue(); 
    }
    public static String formatYearBetween(Date dt){
        Integer y=yearBetween( dt);
        return String.valueOf(y);
    }
    /*
    RH_Birthday_Batch batch = new RH_Birthday_Batch();
    Database.executeBatch(batch , 100);
    */
    

    
}