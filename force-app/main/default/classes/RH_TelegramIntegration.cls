public class RH_TelegramIntegration {
	@AuraEnabled
    public static Boolean sendMessage(String chat_id, String titleParam, String messageParam){
        String ep = Telegram_integration__c.getValues('noeli_bot').endpoint__c;
        String title = EncodingUtil.urlEncode('<b>' + titleParam + ' : </b>', 'UTF-8');
        String message = EncodingUtil.urlEncode('\n' + messageParam , 'UTF-8');
        
        ep = ep + '/sendMessage?chat_id=' + chat_id +'&text=' + title + message + '&parse_mode=html';
        
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setMethod('GET');


        try {
            System.debug('end :: ' + ep);
            request.setEndpoint(ep);
            HttpResponse response = http.send(request);
        } catch (Exception e) {
            System.debug(e.getMessage());
            return false;
        }

        return true;
    }
    
    @AuraEnabled
    public static Boolean sendMessageBulk(List<String> chat_ids, String titleParam, String messageParam){
        Boolean isSent = true;
        try{
            for(String chat_id : chat_ids){
            	sendMessage(chat_id, titleParam, messageParam);
            }
        } catch (Exception e) {
			isSent = false;
		}
        
        return isSent;
    }
}