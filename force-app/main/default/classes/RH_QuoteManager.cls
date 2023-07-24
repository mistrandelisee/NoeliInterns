public with sharing class RH_QuoteManager implements Schedulable{
    // private static QUOTE_ENDPOINT='https://zenquotes.io?api=[mode]';
    public static inquote todayQuote=null;
    public static final  RH_Settings__c cs = RH_Settings__c.getOrgDefaults();
    private static String CurrentQuoteConfiguration=cs.RH_CurrentQuoteConfiguration__c; // store in custom setting
    private static RH_Quote_Configuration__mdt config=null;
    static List<RH_Telegram_Utility.Message> messages = null;
    public RH_QuoteManager() {

    }
    public static void launch(){
        RH_QuoteManager qtMgnt = new RH_QuoteManager();
        String sch = '0 0 9 ? * MON-FRI';//GMT+1
        System.schedule('Daily Quotes Job '+System.now().getTime(), sch, qtMgnt);
    }
    public void execute(SchedulableContext SC) {
        execute();
    }

    @future(callout=true)
    public static void execute(){
        Boolean b=getQuote();
        if(b) {
            buildMessages();
            sendQuote();
        }
        
    }
    public static void sendQuote(){
        System.enqueueJob(new messageQueue(messages, config.boatApiKey__c));
    }
     static void buildMessages(){
        String messagetext= todayQuote.tgFormat();
        messages = new List<RH_Telegram_Utility.Message>();
        for (RH_ChatReceiver__mdt  rcv : [SELECT chatId__c FROM RH_ChatReceiver__mdt WHERE Active__c=true]) {
            //build a defaulft tg message
            RH_Telegram_Utility.Message tg_message= new RH_Telegram_Utility.Message(rcv.chatId__c,messagetext);
            messages.add(tg_message);
        }
        System.debug('messages>> ' + messages);
    }
    

    public static Boolean getQuote(){
        config= getConfig(CurrentQuoteConfiguration);
        if(config==null || config?.isActive__c!=true) return false;
        string endpoint= config.serverEndpoint__c;
        // String BOT_API= config.boatApiKey__c;
        endpoint=endpoint.replace('[mode]','today');
        Http httpClient = new Http();
        HttpRequest request = new HttpRequest();
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json');
        request.setEndpoint(endpoint);
        System.debug('@@@@@endpoint : '+endpoint);
        HttpResponse response = httpClient.send(request);
        System.debug(response.getBody());
        if (response.getStatusCode() != 200) {
            System.debug('error');
            return false;
        }else {
            List<Object> results = (List<Object>) JSON.deserializeUntyped(response.getBody());
            Map<String, Object> data = (Map<String, Object>) results[0];
            todayQuote=new inquote(data);
        }
        return true;
    }
    static RH_Quote_Configuration__mdt getConfig(String action) {
        action= action.toUpperCase();
        RH_Quote_Configuration__mdt config = RH_Quote_Configuration__mdt.getInstance(action);
        return config;
    }
    public class inquote{
        public string quote;
        public string author;
        public string body;
        inquote(Map<string, object> data){
            quote = String.valueOf(data.get('q'));
            author = String.valueOf(data.get('a'));
            body = String.valueOf(data.get('h'));
        }
        public string tgFormat(){//to do 
            String output= '<pre> </pre> <b> \"'+this.quote+'\" </b>'+'\n'+'<pre>    </pre><i>'+this.author+'</i>';
            return output;
        }
    }
    class messageQueue implements Queueable , Database.AllowsCallouts{
        public List<RH_Telegram_Utility.Message> messages;
        public String boatApiKey;
        
        public messageQueue(List<RH_Telegram_Utility.Message> messages, String boatApiKey){
            this.messages= messages;
            this.boatApiKey= boatApiKey;
        }

        public  void sendTelegramMessages(){
            RH_Telegram_Utility.BOT_API=boatApiKey;
            RH_Telegram_Utility.sendMessages(messages);
        }
        public void execute(QueueableContext qc) {
            sendTelegramMessages();
        }
    }
}