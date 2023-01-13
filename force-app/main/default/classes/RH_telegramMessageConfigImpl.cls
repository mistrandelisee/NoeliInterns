global without sharing class RH_telegramMessageConfigImpl  implements RH_telegramMessageConfigInterface {
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();
    public static final  RH_Settings__c cs = RH_Settings__c.getOrgDefaults();
    /** The class instance */
    private static RH_telegramMessageConfigImpl instance = null;
    private static final String START_TOKEN='[[!';
    private static final String END_TOKEN=']]';
    private static Integer N_SIZE=cs.RH_Message_Queue_Size__c != null ? cs.RH_Message_Queue_Size__c.intValue() : 80; // store in custom setting

    
    public static  String WHOIDKEY='Id';
    /** action : custom metadata name 
     * 
    */
    global String action;
    global sObject record;
    global RH_Message_Configuration__mdt config;
    global emailTemplate template;
    global List<RH_Telegram_Utility.Message> messages;


     /**
     * @description @return the class instance
     */
    public static RH_telegramMessageConfigImpl getInstance() {

        if(instance == null) {

            instance = new RH_telegramMessageConfigImpl();
        }
        return instance;
    }
    public RH_telegramMessageConfigImpl(){

    }
    public RH_telegramMessageConfigImpl(String action,String recordId){
        this.action=action;
        this.config = getConfig(action);
        if (config==null) {throw new messageConfigException('missing config'); }

        this.template =getTemplate( config.RH_Template_Name__c);
        if (template==null) {throw new messageConfigException('missing template'); }

        this.record=retrieveRecord(config,recordId);
        if (record==null) { System.debug('missing record'); }
        messages=new List<RH_Telegram_Utility.Message>();
    }
    /** METHODS */
    public RH_Telegram_Utility.Message buildMessage(String who_id_key,contact receiver) {
        String user_id= receiver.get(who_id_key)!=null ? String.valueOf(receiver.get(who_id_key)) : null;//'RH_User__c';
        String chat_id= receiver.RH_tgUserId__c;
        // chat_id= receiver.
        Messaging.SingleEmailMessage mail =  Messaging.renderStoredEmailTemplate(this.template.id,null, user_id);// SOQL
        System.debug('>>>>>>>>>>>>>this.template.id ' + this.template.id);
        
        //build default mapping
        String fieldsStr=this.config.RH_fields__c;
        Map<String,String> mappings=buildMapping(this.record,fieldsStr);

        //build immplementation mapping
        String className=String.isBlank(this.config.RH_Class_Name__c) ? 'RH_telegramMessageConfigImpl' : this.config.RH_Class_Name__c;
        RH_telegramMessageConfigInterface telegramMessageConfigInterface = (RH_telegramMessageConfigInterface) Type.forName(className).newInstance();
        Map<String,Object> inputs=new map<String,Object>{
            'mappings' => mappings,
            'record' => this.record,
            'action'=>this.action,
            'receiver'=> receiver
        };
        mappings= telegramMessageConfigInterface.buildMapping(inputs);

        //format mail content body 
        String html_full= '<u><b>'+mail.getSubject()+'</b></u>';
        html_full= html_full+mail.getHtmlBody();
        String  messagetext=formatBody(html_full,mappings);

        //build a defaulft tg message
        RH_Telegram_Utility.Message tg_message= new RH_Telegram_Utility.Message(chat_id,messagetext);

        //build  tg message according to the implementation
        inputs= new Map<String,Object>{
            'message'=>tg_message,
            'action'=>this.action,
            'record'=>this.record,
            'receiver'=> receiver
        };
        tg_message=(RH_Telegram_Utility.Message) telegramMessageConfigInterface.buildMessage(inputs);
        System.debug('>>>>>>>>>>>>>tg_message ' + tg_message);

        this.messages.add(tg_message);

        return tg_message;
    }

    // Interface Implementation --- START
    public Map<String,String> buildMapping(Object o){
            Map<String,Object> inputs = (Map<String,Object>) o;
            return (Map<String,String>) inputs.get('mappings');
    }
    public Object buildMessage(Object o){
        Map<String,Object> inputs= (Map<String,Object>) o;
        RH_Telegram_Utility.Message tg_message=(RH_Telegram_Utility.Message) inputs.get('message');
        String action = String.valueOf(inputs.get('action'));
        System.debug('action >> ' + action);

        switch on action {
            when 'TG_WELCOME' {
                tg_message=buildWelcomeMessage(tg_message);
            }
            when else {
            
            }
        }
        
        return tg_message;
    }
    // Interface Implementation --- END
   
    //// DEFAULT IMPLEMANTATION --START
    public static Map<String,String> buildMapping(sObject record, string fieldsStr) {
        Map<String,String> mapReturn = new Map<String,String>();
        if (record==null || String.isBlank(fieldsStr)) {return mapReturn;}
        List<String> fields= fieldsStr.split(',');
        for (String field: fields) {
            if (String.isBlank(field)) continue;
            String token =START_TOKEN+field.trim()+END_TOKEN;
            mapReturn.put(token, getValue(record,field));
        }
        return mapReturn;
    }
    //// DEFAULT IMPLEMANTATION --END

    /** UTILITIES --START */
    static RH_Message_Configuration__mdt getConfig(String action) {
        action= action.toUpperCase();
        RH_Message_Configuration__mdt config = RH_Message_Configuration__mdt.getInstance(action);
        return config;
    }
    static EmailTemplate getTemplate(String template_name) {
        return [SELECT id,name,HtmlValue,subject,description,Body FROM EmailTemplate where DeveloperName=:template_name];
    }
    static sObject retrieveRecord(RH_Message_Configuration__mdt config,String recordId){
        
        if (String.isBlank(config.RH_ObjectApiName__c)) {
            // throw new messageConfigException('missing object');
            System.debug('missing object');
            return null;
        }
        if (String.isBlank(recordId)) {
            // throw new messageConfigException('missing object');
            System.debug('missing record');
            return null;
        }
        String query='SELECT '+config.RH_fields__c+' FROM '+config.RH_ObjectApiName__c+' WHERE Id =\''+String.escapeSingleQuotes(recordId) +'\'';
        
        return Database.query(query);
    }
    static String  formatBody(String body,Map<String,String> mapping) {
        Set<String> fields= mapping.keySet();
        for (String token : fields) {
            // String token =START_TOKEN+field+END_TOKEN;
            String value= mapping.get(token);
            body = body.replace(token, value);
        }

        return body;
    }
    static String  getValue(sObject record, string field) {
        if (record == null || String.isBlank(field)) return '';
        field =field.trim();
        if (field.contains('.')) {//is a relation
            String relationName= field.substringBefore('.').trim();
            field= field.substringAfter('.');
            record = record.getSObject(relationName);
            return getValue( record, field);
        }else{
            object obj=record.get(field);
            String value=String.valueOf(formatObj(obj));
            return String.isBlank(value)?'':value;
        }
    }
    static object formatObj(object o){
        /*if (o instanceof Datetime) {
            return (DateTime)JSON.deserialize(String.valueOf(o), DateTime.class);
        }*/
        return o;
    }

    static RH_Telegram_Utility.Message buildWelcomeMessage(RH_Telegram_Utility.Message welcomeMessage){
        
        List<RH_Telegram_Utility.InlineKeyboardButton> buttons = new List<RH_Telegram_Utility.InlineKeyboardButton>{
            new RH_Telegram_Utility.InlineKeyboardButton('By Email','Identification::email'),
            new RH_Telegram_Utility.InlineKeyboardButton('By Username','Identification::username')
        };
        RH_Telegram_Utility.InlineKeyboardMarkup markup = new RH_Telegram_Utility.InlineKeyboardMarkup();
        markup.inline_keyboard.add(buttons);

        welcomeMessage.reply_markup=markup;

        return welcomeMessage;
    }
   
    public class messageConfigException extends Exception {
        
    }

    /**ENTRY POINTS ---START */
    public static void notifyTelegram(String action,String record_id,List<String> uIds){// entry point
        if (uIds.size() > N_SIZE) {
            notifyTelegramAsync(action,record_id,uIds);
        }else{
            notifyTelegramSync(action,record_id,uIds);
        }
    }
    public static void notifyTelegramAsync(String action,String record_id,List<String> uIds){ // entry point
        System.enqueueJob(new messageQueue(action, record_id,WHOIDKEY, uIds));
    }
    public static void notifyTelegramSync(String action,String recordId,List<String> uIds){ // entry point
        RH_telegramMessageConfigImpl impl= new RH_telegramMessageConfigImpl(action,recordId);
        doNotif(impl,WHOIDKEY,uIds);
        /*for (Contact rcv : contactQry.getContactByUserIds(uIds)) { //  SOQL N 1
            if(String.isNotBlank(rcv.RH_tgUserId__c)){
                String userId= rcv.get(WHOIDKEY)!=null ? String.valueOf(rcv.get(WHOIDKEY)) : null;//'RH_User__c';
                String chatId= rcv.RH_tgUserId__c;
                impl.buildMessage(chatId, userId);// SOQL 1 * N (/ N < N_Size)
            }
        }
        if (! impl.messages.isEmpty()) {
            RH_Telegram_Utility.sendMessages(impl.messages);//callout + DML
        }*/
    }
    /**ENTRY POINTS ---END */
    private static void doNotif(RH_telegramMessageConfigImpl impl,String who_id_key,List<String> uIds){ 
        for (Contact rcv : contactQry.getContactByUserIds(uIds)) { //  SOQL N 1
            if(String.isNotBlank(rcv.RH_tgUserId__c)){
                // String userId= rcv.get(who_id_key)!=null ? String.valueOf(rcv.get(who_id_key)) : null;//'RH_User__c';
                // String chatId= rcv.RH_tgUserId__c;
                impl.buildMessage(who_id_key, rcv);// SOQL 1 * N (/ N < N_Size)
            }
        }
        if (! impl.messages.isEmpty()) {
            RH_Telegram_Utility.sendMessages(impl.messages);//callout + DML
        }
    }

    /** messageQueue  */
    class messageQueue implements Queueable , Database.AllowsCallouts{
        public RH_telegramMessageConfigImpl impl;
        public List<String> receiversIds=new List<String>();
        public List<String> allIds=new List<String>();
        string who_id_key='Id';

        
        public messageQueue(String action,String recordId,List<String> uIds){
            this.impl= new RH_telegramMessageConfigImpl(action,recordId);
            prepareList(uIds);
        }
        public messageQueue(String action,String recordId,string who_id_key,List<String> uIds){
            this.impl= new RH_telegramMessageConfigImpl(action,recordId);
            this.who_id_key=who_id_key;
            prepareList(uIds);
        }
        private messageQueue(RH_telegramMessageConfigImpl impl,List<String> uIds){
            this.impl= impl;
            prepareList(uIds);
        }
        void prepareList(List<String> uIds){
            if (uIds.size() > N_SIZE) {
                for (Integer i = 0; i < N_SIZE; i++) {
                    this.receiversIds.add(uIds.remove(0));
                }
            }
            else {
                this.receiversIds=uIds;
                uIds=new List<String>();
            }
            this.allIds=uIds;
            this.impl.messages= new List<RH_Telegram_Utility.Message>();
        }

        public  void sendTelegramMessages(){

            doNotif(this.impl,who_id_key,this.receiversIds);

            if (!Test.isRunningTest() && !this.allIds.isEmpty() ) {
                System.enqueueJob(new messageQueue(this.impl, this.allIds));
            }

        }
        public void execute(QueueableContext qc) {
            sendTelegramMessages();
        }
    }

}