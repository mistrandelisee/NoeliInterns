@RestResource(urlMapping='/Telegram/*')
global without sharing class RH_TelegramWebService {
    //tg_username__c
    public static final  RH_Settings__c cs = RH_Settings__c.getOrgDefaults();
    // public static String BOT_API = cs.RH_SF_AuthToken__c;
    private static final String SECRET_TOKEN_KEY = 'X-Telegram-Bot-Api-Secret-Token';
    private static final String SECRET_TOKEN = cs.RH_SF_AuthToken__c;//'SF_KEY_TOKEN';//to store in custom setting
    private static final List<String> SYSTEMS = new List<String>{
        'SF','TELEGRAM'
    };
    private static  Boolean SKIP_AUTH = false;
    private static final String CLOSED_INTERACTION = 'Closed';
    private static final String MESSAGE_TYPE = 'message';
    private static final String CALLBACK_QUERY_TYPE = 'callback_query';
    private static String tg_userId = '';
    private static final String CANCELED_INTERACTION = 'Cancel';
    private static final String INDENTIFICATION_STEP = 'Identification';
    private static final List<String> CLOSED_INTERACTIONS = new List<String>{
        CLOSED_INTERACTION,CANCELED_INTERACTION
    };
    private static List<RH_TgInteract__c> Interactions =new list<RH_TgInteract__c>();
    private static List<Contact> contacts =new list<Contact>();
    private static contact user_contact = null;



    private static void displayMap(Map<String,Object> mapInput,String mapName) {
        System.debug('@@@@@View Map : ' + mapName);
        for(String key : mapInput.keySet()){ 
            Object item = mapInput.get(key);
            System.debug( key+'=>' + item);
        }
    }
    @HttpPost
    global static boolean syncUpdate() {
        tg_userId = '';
        String reply = '';
        string update_type = '';
        Map<String, Object> handled_map=new Map<String, Object>();
        // Boolean is_message = false;
        // Boolean is_callBack = false;
        responseObj logx= new ResponseObj();
        // Map<String, String> output= new map<String, String>();
        Map<String, Object> dataReceived = null;
        try {
            logx.code='200';
            dataReceived = (Map<String, Object>) JSON.deserializeUntyped(RestContext.request.requestBody.toString());
            Map<String, String> dataHeader = RestContext.request.headers;
            String token= dataheader.get(SECRET_TOKEN_KEY);
            if (!token.equals(SECRET_TOKEN)) {
                throw new tg_Exception('Unknown Call');
                // return false;
            }
            displayMap(dataHeader,'dataHeader');
            displayMap(dataReceived,'dataReceived');
            //Get user and message details
            Map<String, Object> message = (Map<String, Object>) dataReceived.get('message');
            Map<String, Object> callback_query = (Map<String, Object>) dataReceived.get('callback_query');
           
            if (message!=null) {
                update_type=MESSAGE_TYPE;
                tg_userId=getChatId(message);
            }else{
                if (callback_query!=null) {
                    update_type=CALLBACK_QUERY_TYPE;
                    tg_userId=getChatId(callback_query);
                }else{
                    throw new tg_Exception('Unknown operation');
                }
            }
            if(String.isBlank(tg_userId)) {
                throw new tg_Exception('Missing user id');
            }
            
            
            //Find contact
            contacts = [SELECT id , Name FROM Contact WHERE RH_tgUserId__c = :tg_userId];
            Interactions =[SELECT id,RH_Step__c,Interactor__c,RH_ChatId__c,RH_Content__c FROM RH_TgInteract__c WHERE RH_ChatId__c = :tg_userId AND RH_Step__c NOT IN:CLOSED_INTERACTIONS ORDER BY CREATEDDATE DESC ];
            
            if((contacts.size() == 0) && (Interactions.size() == 0) ) {
                logx.message=JSON.serialize(doStart());
            }
           
            if(contacts.size() > 0) {
                // user already indentify
                logx.message='user already indentify';
                user_contact=contacts[0];
                SKIP_AUTH=true;
                // sendMessage(tg_userId, 'user already indentify');
            } 

            switch on update_type {
                when 'message' {
                    handled_map=handleIncomeMessage(message);
                }
                when 'callback_query' {
                    handled_map=handleIncomeCallbackQuery(callback_query);
                }
                when else {
                
                }
            }

            if (handled_map.get('response') != null) {
                 logx =  (ResponseObj) handled_map.get('response');
            }
        } catch(Exception e) {
            logx.code='101';
            String msg = e.getMessage()+' '+e.getStackTraceString();
            System.debug(msg);
            logx.message=msg;
            reply = 'ERROR\n'+msg;
        }
        
        saveLog( dataReceived,logx,tg_userId);
        //Send reply
        return true;
    }
    static RH_TgInteract__c doStart(){
        // send welcome message
        RH_TgInteract__c interaction= new RH_TgInteract__c(RH_ChatId__c = tg_userId);
                        
        insert interaction;
        // logx.message=JSON.serialize(interaction);
        sendWelcomeMessage(tg_userId);
        return interaction;
    } 
    static  Map<String, Object> doCancel(){
        responseObj logx= new ResponseObj();
        
        logx.message='Cancelation';
        if(Interactions.size() > 0) {
            for (RH_TgInteract__c interaction : Interactions) {
                interaction.RH_Step__c=CANCELED_INTERACTION;
            }
            update Interactions;
        }
        if(contacts.size() == 0){doStart();}else{
            sendMessage(tg_userId,'Operation Cancelled');
        }
        return new Map<String, Object>{
            'response'=>logx
        };
    } 
    static  Map<String, Object> startInteraction(){
        responseObj logx= new ResponseObj();
        logx.message='Start';
        if(Interactions.size() > 0) {
            for (RH_TgInteract__c interaction : Interactions) {
                interaction.RH_Step__c=CANCELED_INTERACTION;
            }
            update Interactions;
        }
        if(contacts.size() == 0){doStart();}else{
            String namex=user_contact.Name;
            sendMessage(tg_userId,'Hi <b>'+namex+'</b> !');
        }
        return new Map<String, Object>{
            'response'=>logx
        };
    } 
    static  Map<String, Object> doClose(){
        
        responseObj logx= new ResponseObj();
        logx.message='Close';
        if(Interactions.size() > 0) {
            for (RH_TgInteract__c interaction : Interactions) {
                interaction.RH_Step__c=CANCELED_INTERACTION;
            }
            update Interactions;
        }
        if (user_contact != null) {
            user_contact.RH_tgUserId__c= null;
            update user_contact;
        }
        doStart();
        return new Map<String, Object>{
            'response'=>logx
        };
    } 


    private static Map<String, Object> handleIncomeCallbackQuery(Map<String, Object> callback_query) {
        String call_id=String.valueOf(callback_query.get('id'));
        Map<String, Object> fromUser = (Map<String, Object>) callback_query.get('from');
        // tg_userId=String.valueOf(fromUser.get('id'));
        String data= String.valueOf(callback_query.get('data'));
        responseObj logx= new ResponseObj();
        logx.message='';
        if(Interactions.size() > 0) {
            RH_TgInteract__c currentInteraction = Interactions[0];
            if (String.isNotBlank(data)) {
                // data is formattdd like this "<step>::<something>::<value>"
                List<String> data_list = data.split('::');
                Integer l_size=data_list.size();
                String step= data_list[0];
                String info= data_list[l_size-1];


                content_Type content= new content_Type();
                content.data= data;
                
                currentInteraction.RH_Step__c=step;
                content.value=info;
                currentInteraction.RH_Content__c=JSON.serialize(content);
                update currentInteraction;


                logx.message='Enter your '+info;
                // sendMessage(tg_userId,logx.message);

                
            }
        }
        answerCallbackQuery(call_id, logx.message);
        return new Map<String, Object>{
            'response'=>logx
        };
    }
    private static final String CANCEL_CMD = '/cancel';
    private static final String CLOSED_CMD = '/closed';
    private static final String START_CMD = '/start';
    private static Map<String, Object> handleIncomeMessage(Map<String, Object> messageMap) {
        // String call_id=String.valueOf(messageMap.get('id'));
        
        Map<String, Object> fromUser = (Map<String, Object>) messageMap.get('from');
        // tg_userId=String.valueOf(fromUser.get('id'));
        String data= String.valueOf(messageMap.get('text'));
        responseObj logx= new ResponseObj();
        if (CANCEL_CMD.equalsIgnoreCase(data)) {
            // logx.message='Cancelation';
           return doCancel();
        } 
        if (CLOSED_CMD.equalsIgnoreCase(data)) {
            // logx.message='Closed';
            return doClose();
        }  
        if (START_CMD.equalsIgnoreCase(data)) {
            // logx.message='Start';
            return startInteraction();
        }  
        //manage response from a callback query response of the user
        if(Interactions.size() > 0) {
            RH_TgInteract__c currentInteraction = Interactions[0];
            if (currentInteraction.RH_Step__c=='Identification') {
                Content_type currcontent = (Content_type) JSON.deserialize(currentInteraction.RH_Content__c, Content_type.class);
                String field= currcontent.value;
                string val= data.trim();
                field= field.equalsIgnoreCase('username')? 'RH_User__r.Username':field;
                String query='SELECT Id, Name FROM Contact WHERE ' + field +'=:val';

                System.debug(query);

                List<Contact> Cons=Database.query(query);
                if (cons.isEmpty()) {
                    logx.message='User not founded...Retry';
                    sendMessage(tg_userId,logx.message);
                    throw new tg_Exception('User not founded!!');
                } 
                user_contact=Cons[0]; 

                //need to implement verification step
                user_contact.RH_tgUserId__c= tg_userId;
                update user_contact;

                currcontent.value=val;

                currentInteraction.RH_Content__c=JSON.serialize(currcontent);
                currentInteraction.Interactor__c=user_contact.Id;
                currentInteraction.RH_Step__c=CLOSED_INTERACTION;

                update currentInteraction;
                String Namex=user_contact.Name;
                String reply='Hi <b>'+namex+'</b>, your identification is completed!\n You will be notified each time there\'s an update';
                logx.message=reply;
                sendMessage(tg_userId,reply);
            }
        }
        return new Map<String, Object>{
            'response'=>logx
        };
    }

    private static void saveLog(Object dataReceived,responseObj resp,string parentId ) {
        try {
            //save log
            RH_Logs_Utility.writeLog(JSON.serialize(dataReceived),  JSON.serialize(resp),  'IN','syncUpdate', resp.code=='101', SYSTEMS, false,parentId);
        } catch(Exception e) {
            String msg = e.getMessage()+' '+e.getStackTraceString();
            System.debug('############## saveLog ::: '+msg);
        }
    }
    private static String getChatId(Map<String, Object> messageMap){
        Map<String, Object> fromUser = (Map<String, Object>) messageMap.get('from');
        return  String.valueOf(fromUser.get('id'));
    }
    @future(callout = true)
    private static void answerCallbackQuery(String calId, String reply) {
        RH_Telegram_Utility.queryAnswer answer = new RH_Telegram_Utility.queryAnswer(calId, reply);
        RH_Telegram_Utility.answerCallbackQuery(answer);
    }
    @future(callout = true)
    private static void sendMessage(String tg_userId, String reply) {
        RH_Telegram_Utility.Message message = new RH_Telegram_Utility.Message(tg_userId, reply);
        RH_Telegram_Utility.sendMessage(message);
    }
    @future(callout = true)
    private static void sendWelcomeMessage(String tg_userId) {
        RH_Telegram_Utility.Message message =  RH_Telegram_Utility.buildWelcomeMessage(tg_userId);
        RH_Telegram_Utility.sendMessage(message);
    }
    /*@HttpPost
    global static String upsertContact() {
        System.debug('Wellcome');
        try{
            RestRequest request = RestContext.request;
            String response = request.requestBody.toString().replaceAll('(\\r|\\n|\\s+)+', ' ');
            response = response.replaceAll(', }', '}');
            response = response.replaceAll('"from"', '"fromKey"');
            response = response.replaceAll('"id"', '"idKey"');
            response = response.replaceAll('"date"', '"dateKey"');
            PostData result = (PostData) JSON.deserializeStrict(response, PostData.class);

            //Map<String, Object> m = (Map<String, Object>)JSON.deserializeUntyped(response);
            //List<Result> res = (List<Result>) m.get('result');
        
            System.debug(result.result[0]);
            return response;
        } catch(Exception e){
            System.debug(e.getMessage());
            return e.getMessage();
        }
    }*/
    global class tg_Exception extends Exception {
        
    }
    public class content_Type {
        public string data;
        public String value;
    }
    
    public class PostData {
        public Boolean ok;
        public List<Result> result = new List<Result>();
    }

    public class Result {
        public String update_id;
        public Message message;
    }

    public class Message {
        public Integer message_id;
        public FromKey fromKey = new FromKey();
        public Chat chat = new Chat();
        public Integer dateKey;
        public String text;
        public List<Entities> entities = new List<Entities>();
    } 

    public class FromKey {
        public String idKey;
        public Boolean is_bot;
        public String first_name;
        public String username;
        public String language_code;
    }

    public class Chat {
        public String idKey;
        public String first_name;
        public String type;
        public String username;
    }
    public class responseObj {
        public String message;
        public String code;
        public ResponseObj(){
            message = '';
            code='000';
        }
    }

    public Class Entities {
        public Integer offset;
        public Integer length;
        public String type;
    }
}