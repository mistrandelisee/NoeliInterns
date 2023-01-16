public class RH_Birthday_Batch implements Schedulable, Database.Stateful, RH_telegramMessageConfigInterface {
    
    List<String> user_birthday_ids = new List<String>();
    List<String> user_workday_ids = new List<String>();
    private static final String BIRTHDAY_ACTION =RH_Constans.PERSONAL_BIRTHDAY_ACTION;
    private static final String WORKDAY_BIRTHDAY_ACTION = RH_Constans.WORK_BIRTHDAY_ACTION;
    private static final String AGE_TOKEN = '[[!Age]]';
    private static final String WORK_AGE_TOKEN = '[[!Work_Age]]';
    integer l_size=50000;
    public RH_Birthday_Batch(Integer l_size) { this.l_size=l_size; }
    public RH_Birthday_Batch() {}
    public void execute(SchedulableContext SC) {
        doJob();
    }
    public void doJob(){
        String recordTypeId=RH_Constans.RH_CONTACT_RT;
        for (Contact con : [SELECT Name,Birthdate,RH_Started_Date__c,RH_User__c FROM Contact WHERE recordTypeId=:recordTypeId AND RH_User__c != NULL AND RH_tgUserId__c != NULL AND RH_Status__c='Active' ORDER BY CreatedDate LIMIT :l_size ]){
            System.debug('con ' + con);
            if (isThisDay(con.Birthdate)) {
                user_birthday_ids.add(con.RH_User__c);
            }
            if (isThisDay(con.RH_Started_Date__c)) {
                user_workday_ids.add(con.RH_User__c);
            }
        }
        if (! user_birthday_ids.isEmpty()) {
            RH_telegramMessageConfigImpl.notifyTelegram(BIRTHDAY_ACTION,null,user_birthday_ids)  ; 
        }
        if (! user_workday_ids.isEmpty()) {
            RH_telegramMessageConfigImpl.notifyTelegram(WORKDAY_BIRTHDAY_ACTION,null,user_workday_ids)  ; 
        }
    }
    
    public static void run() {
        RH_Birthday_Batch bsch = new RH_Birthday_Batch();
        String sch = '0 0 8 * * ?';//Class runs every day at 8 AM.
        String jobID = System.schedule('Anniversary Job_'+System.now().getTime(), sch, bsch);
    }
    public static void run(Integer l_size, String sch) {
        RH_Birthday_Batch bsch = new RH_Birthday_Batch(l_size);
        // String sch = '0 0 8 * * ?';//Class runs every day at 8 AM.
        String jobID = System.schedule('Anniversary Job_'+System.now().getTime(), sch, bsch);
    }
    
    

    

    // Interface Implementation --- START
    public Map<String,String> buildMapping(Object o){
    Map<String,Object> inputs = (Map<String,Object>) o;
    Map<String,String> mappings = (Map<String,String>) inputs.get('mappings');
    Contact receiver = (Contact) inputs.get('receiver');
    String action = String.valueOf(inputs.get('action'));
    switch on action {
        when 'TG_PERSONAL_BIRTHDAY' {
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
    if (dt >= td ) { return false; }
    return (td.day()==dt.day() && td.month()==dt.month());
    }
    Integer yearBetween(Date dt) {
    Date td= system.today();
    if (dt == Null ) { return 0; }
    if (dt >= td ) { return 0; }
    Decimal years=dt.monthsBetween(td) / 12;
    return years.intValue(); 
    }
    String formatYearBetween(Date dt){
    Integer y=yearBetween( dt);
    return String.valueOf(y);
    }
    
}
