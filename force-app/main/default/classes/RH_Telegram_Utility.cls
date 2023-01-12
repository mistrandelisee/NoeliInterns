public without sharing class RH_Telegram_Utility {
    public static final  RH_Settings__c cs = RH_Settings__c.getOrgDefaults();
    public static String BOT_API = cs.RH_TelegramBotAPIKey__c;
    private static final List<String> SYSTEMS = new List<String>{
        'SF','TELEGRAM'
    };
    private static NL_Logs__c saveLog(Boolean toInsert,HttpRequest request,HttpResponse response,string methodName ) {
        NL_Logs__c log = new NL_Logs__c();
        try {
            if (toInsert) {
                log= RH_Logs_Utility.writeLog(request.getBody(),  response.getBody(),  'OUT',methodName, response.getStatusCode()==200, SYSTEMS, false,null);
            }else{
                log= RH_Logs_Utility.prepareLog(request.getBody(),  response.getBody(),  'OUT',methodName, response.getStatusCode()==200, SYSTEMS, false,null);
            }
            
            return log;
           
        } catch(Exception e) {
            String msg = e.getMessage()+' '+e.getStackTraceString();
            return null;
        }
    }
    public static  Map<String, Object> sendMessage(Message message) {
        Map<String, Object> mapReturn = new Map<String, Object>();
        Http httpClient = new Http();
        HttpRequest request = new HttpRequest();
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setEndpoint('https://api.telegram.org/bot' + BOT_API + '/sendMessage');
        String body = JSON.serialize(Message);
        System.debug(body);
        request.setBody(body);
        HttpResponse response = httpClient.send(request);
        saveLog(true,request,response,'sendMessage');
        mapReturn.put('response', response);
        mapReturn.put('request', request);
        return mapReturn;
    }
    public static Map<String, Object> sendMessage(Message message, boolean savelog) {

        Map<String, Object> mapReturn = new Map<String, Object>();
        Http httpClient = new Http();
        HttpRequest request = new HttpRequest();
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setEndpoint('https://api.telegram.org/bot' + BOT_API + '/sendMessage');
        String body = JSON.serialize(Message);
        System.debug(body);
        request.setBody(body);
        HttpResponse response = httpClient.send(request);

        mapReturn.put('response', response);
        mapReturn.put('request', request);
        mapReturn.put('log', saveLog(savelog,request,response,'sendMessage'));

        return mapReturn;
    }
    public static List<HttpResponse> sendMessages(List<Message> messages){
        List<HttpResponse> responses = new List<HttpResponse>();
        List<NL_Logs__c> logs = new List<NL_Logs__c>();

        for (Message message: messages) {
            Map<String, Object> mapReturn = sendMessage(message, false);
            HttpRequest request = (HttpRequest)mapReturn.get('request');
            HttpResponse response = (HttpResponse)mapReturn.get('response');
            NL_Logs__c log = (NL_Logs__c)mapReturn.get('log');
            logs.add(log);
            responses.add(response);
        }
        RH_Logs_Utility.saveLogs(logs);
        return responses;
    }
    public static HttpResponse answerCallbackQuery(queryAnswer answer) {
        Http httpClient = new Http();
        HttpRequest request = new HttpRequest();
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setEndpoint('https://api.telegram.org/bot' + BOT_API + '/answerCallbackQuery');
        String body = JSON.serialize(answer);
        System.debug(body);
        request.setBody(body);
        HttpResponse response = httpClient.send(request);
        saveLog(true,request,response,'answerCallbackQuery');
        return response;
    }
    public static message buildWelcomeMessage(String chatId){
        // strBody;
        String welcome_html='<b>Welcome to NOELI!</b>\n Tell us how can we recognize you:';
        Message welcomeMessage = new Message(chatId,welcome_html);

        List<InlineKeyboardButton> buttons = new List<InlineKeyboardButton>{
            new InlineKeyboardButton('By Email','Identification::email'),
            new InlineKeyboardButton('By Username','Identification::username')
        };
        InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
        markup.inline_keyboard.add(buttons);

        welcomeMessage.reply_markup=markup;

        return welcomeMessage;
    }
    
    public class Message {
        Public String chat_id;
        Public String text;
        Public String parse_mode='html';
        Public Object reply_markup;
        
        public Message(String chat_id, String text) {
            this.chat_id = chat_id;
            this.text = text;
            reply_markup=new ReplyKeyboardMarkup();
        }
        public Message(String text) {
            this.chat_id = null;
            this.text = text;
            reply_markup=new ReplyKeyboardMarkup();
        }
        
        
    }
    public class queryAnswer {
        Public String callback_query_id;
        Public String text;
        Public Boolean show_alert=true;
        Public Integer cache_time=36000;
        
        public queryAnswer(String callback_query_id, String text) {
            System.debug('callback_query_id' + callback_query_id);
            this.callback_query_id = callback_query_id;
            this.text = text;
        }
        
        
    }
    public class ReplyKeyboardMarkup {
        Public List<keyboard_tg> keyboard;
        
        public ReplyKeyboardMarkup() {
            this.keyboard = new List<keyboard_tg>();
        }
        
    }
    public class InlineKeyboardMarkup {
        Public List<List<InlineKeyboardButton>> inline_keyboard;
        
        public InlineKeyboardMarkup() {
            this.inline_keyboard = new List<List<InlineKeyboardButton>>();
        }
        
    }
    public class keyboard_tg {
        Public String text;
        
        public keyboard_tg(String text) {
            this.text = text;
        }
        
    }
    public class InlineKeyboardButton {
        Public String text;
        Public String callback_data;
        
        public InlineKeyboardButton(String text,String callback_data) {
            this.text = text;
            this.callback_data = callback_data;
        }
        
    }

}