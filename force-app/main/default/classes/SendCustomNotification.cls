public with sharing class SendCustomNotification {
    public static void sendNotifications(String strBody, String strSenderId, String strTargetId, String strTitle,set<String> setUserIds) {
        // Get the Id for our custom notification type
        CustomNotificationType notificationType = [SELECT Id, DeveloperName FROM CustomNotificationType WHERE DeveloperName='Test_Notification'];

        Messaging.CustomNotification obj = new Messaging.CustomNotification();
        
        // Custom notification type Id
        obj.setNotificationTypeId(notificationType.Id);
        
        // when we click on the notification it will redirect to the specified targetId
        obj.setTargetId(strTargetId);
        
        // Notification Title
        obj.setTitle(strTitle);
        
        // Notification Body
        obj.setBody(strBody);
        
        // send used to send the notification, pass the set of user ids , Group or Queue member
        obj.send(setUserIds);
    }
}