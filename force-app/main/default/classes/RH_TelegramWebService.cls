@RestResource(urlMapping='/Telegram/*')
global without sharing class RH_TelegramWebService {
    //tg_username__c
    private static final String SECRET_TOKEN_KEY = 'X-Telegram-Bot-Api-Secret-Token';
    private static final String SECRET_TOKEN = 'SF_KEY_TOKEN';//to store in custom setting
    private static final List<String> SYSTEMS = new List<String>{
        'SF','TELEGRAM'
    };
    private static final String CLOSED_INTERACTION = 'Closed';
    private static String tg_userId = '';
    private static final String CANCELED_INTERACTION = 'Cancel';
    private static final List<String> CLOSED_INTERACTIONS = new List<String>{
        CLOSED_INTERACTION,CANCELED_INTERACTION
    };
    @HttpGet
    global static String syncUpdatetest(){
        String testvar='';
        List<contact> contacts = new List<Contact>();
        for (Contact con : [SELECT Firstname,RH_tgUserId__c FROM Contact]) {

            testvar= testvar + con.firstname + con.RH_tgUserId__c;
            con.RH_tgUserId__c='test'+System.now().getTime();
            contacts.add(con);
        }
        // update contacts;
        return testvar;
    }
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
        contact user_contact = null;
        Boolean is_message = false;
        Boolean is_callBack = false;
        responseObj logx= new ResponseObj();
        Map<String, String> output= new map<String, String>();
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
                is_message=true;

                output=handleMessage(message);
            }else{
                if (callback_query!=null) {
                    is_callBack=true;
                    output= handleCallbackQuery(callback_query);
                }else{
                    throw new tg_Exception('Unknown operation');
                }
            }
            
            
            //Find contact
            List<Contact> contacts = [SELECT id FROM Contact WHERE RH_tgUserId__c = :tg_userId];
            List<RH_TgInteract__c> Interactions =[SELECT id,RH_Step__c,Interactor__c,RH_ChatId__c,RH_Content__c FROM RH_TgInteract__c WHERE RH_ChatId__c = :tg_userId AND RH_Step__c NOT IN:CLOSED_INTERACTIONS ORDER BY CREATEDDATE DESC ];
            if((contacts.size() == 0) && (Interactions.size() == 0) ) {
                // send welcome message
                RH_TgInteract__c interaction= new RH_TgInteract__c(RH_ChatId__c = tg_userId);
                
                insert interaction;
                logx.message=JSON.serialize(interaction);
                sendWelcomeMessage(tg_userId);
                // reply = 'Contact Created! You can now receive updates from Salesforce.\nThanks';
            }
           
            if(contacts.size() > 0) {
                // user already indentify
                logx.message='user already indentify';
                user_contact=contacts[0];
                sendMessage(tg_userId, 'user already indentify');
            } 
            if(Interactions.size() > 0) {
                RH_TgInteract__c currentInteraction = Interactions[0];
                // if (currentInteraction.RH_Step__c=='Open') {
                    if (output!=null && output.get('response') != null) {
                        String data= output.get('response');
                        content_Type content= new content_Type();
                        content.data= data;
                        if (is_callBack) {
                            List<String> data_list = data.split('::');
                            String step= data_list[0];
                            String info= data_list[1];
                            currentInteraction.RH_Step__c=step;
                            content.value=info;
                            currentInteraction.RH_Content__c=JSON.serialize(content);
                            update currentInteraction;
                            reply='Enter your '+info;
                            logx.message=reply;
                            sendMessage(tg_userId,reply);

                        }
                        if (is_message) {
                            if (currentInteraction.RH_Step__c=='Identification') {
                                Content_type currcontent = (Content_type) JSON.deserialize(currentInteraction.RH_Content__c, Content_type.class);
                                String field= currcontent.value;
                                string val= data.trim();
                                field= field.equalsIgnoreCase('username')? 'RH_User__r.Username':field;
                                String query='SELECT Id FROM Contact WHERE ' + field +'=:val';

                                System.debug(query);

                                List<Contact> Cons=Database.query(query);
                                if (cons.isEmpty()) {
                                    reply='User not founded...Retry';
                                    logx.message=reply;
                                    sendMessage(tg_userId,reply);
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
                                reply='Indentification Complete';
                                logx.message=reply;
                                sendMessage(tg_userId,reply);
                            }
                        }

                        
                    }
                // }
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
    private static void saveLog(Object dataReceived,responseObj resp,string parentId ) {
        try {
            //save log
            RH_Logs_Utility.writeLog(JSON.serialize(dataReceived),  JSON.serialize(resp),  'IN','syncUpdate', resp.code=='101', SYSTEMS, false,parentId);
        } catch(Exception e) {
            String msg = e.getMessage()+' '+e.getStackTraceString();
            System.debug('############## saveLog ::: '+msg);
        }
    }
    private static Map<String, String> handleCallbackQuery(Map<String, Object> callback_query) {
        tg_userId=getChatId(callback_query);
        return new Map<String, String>{
            'response'=>String.valueOf(callback_query.get('data'))
        };
    }
    private static Map<String, String> handleMessage(Map<String, Object> messageMap) {
        tg_userId=getChatId(messageMap);
        return new Map<String, String>{
            'response'=>String.valueOf(messageMap.get('text'))
        };

    }
    private static String getChatId(Map<String, Object> messageMap){
        Map<String, Object> fromUser = (Map<String, Object>) messageMap.get('from');
        return  String.valueOf(fromUser.get('id'));
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
    }

    public Class Entities {
        public Integer offset;
        public Integer length;
        public String type;
    }
}