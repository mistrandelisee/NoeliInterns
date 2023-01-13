public  without sharing class RH_Notification_Utility {
    
    private static final String NOTIFICATION_NAME = 'Test_Notification';
    private static RH_Contact_Query contactQry = RH_Contact_Query.getInstance();
    
    
    public static void notify(String strBody, String pgRef,  String strTitle,List<String> setUserIds) {

        set<String> setUserId = new Set<String>(setUserIds);

        system.debug('@@@@pgRef--->  ' + pgRef);
        CustomNotificationType notificationType = [SELECT Id, DeveloperName FROM CustomNotificationType WHERE DeveloperName=:NOTIFICATION_NAME];

        Messaging.CustomNotification obj = new Messaging.CustomNotification();
        
        // Custom notification type Id
        obj.setNotificationTypeId(notificationType.Id);
        
        // when we click on the notification it will redirect to the specified targetId
        // obj.setTargetId(strTargetId);
        
        // when we click on the notification it will redirect to the setTargetPageRef targetId
        obj.setTargetPageRef( pgRef );

        // Notification Title
        obj.setTitle(strTitle);

        // Notification Body
        obj.setBody(strBody);
        
        // send used to send the notification, pass the set of user ids , Group or Queue member
        obj.send(setUserId);

        // notifyTelegram(strBody, strTitle, setUserIds);
    }
    @future(callout = true)
    public static void notifyTelegram(String strBody,String strTitle,List<String> setUserIds){
        List<String> tg_receivers = new List<String>();
        List<RH_Telegram_Utility.Message> messages = new List<RH_Telegram_Utility.Message>();
        String messageBody = '<b>' + strTitle + ' : </b>\n' +strBody;
        
        for (Contact rcv : contactQry.getContactByUserIds(setUserIds)) {
            if(String.isNotBlank(rcv.RH_tgUserId__c)){
                tg_receivers.add(rcv.RH_tgUserId__c);
                RH_Telegram_Utility.Message message = new RH_Telegram_Utility.Message(rcv.RH_tgUserId__c, messageBody);
                messages.add(message);
            }
        }
        RH_Telegram_Utility.sendMessages(messages);
    }

}