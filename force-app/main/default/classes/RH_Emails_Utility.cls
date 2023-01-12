public  class RH_Emails_Utility {
    private static final  RH_Settings__c cs = RH_Settings__c.getOrgDefaults();
    public static void sendMailMethod(List<String> recipients,String emailSubject, String body, String useHTML, Messaging.EmailFileAttachment fileAttachments){
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage(); 
        mail.setToAddresses(recipients);
        mail.setPlainTextBody(body);
        mail.setHtmlBody(useHTML);
        // mail.setBccSender(false);
        if(fileAttachments != NULL){
              mail.setFileAttachments(new Messaging.EmailFileAttachment[] {fileAttachments});
            }
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] {mail});
    }
    public static void sendUserResetPassword(Map<String, Object> emailInputMap){
        try{
            
        //  OrgWideEmailAddress[] owea = [select Id from OrgWideEmailAddress where DisplayName =: ORG_WIDE_DSP_NAME];
        String userId=string.valueOf(emailInputMap.get('userId'));
        String password=string.valueOf(emailInputMap.get('Password'));
        String profilePage=cs.community_profile_Link__c;//'https://noeli-interns-developer-edition.eu44.force.com/NoeliInterns/s/rhprofile';//
        String[] toAddresses = new list<String>{userId};
        System.debug('add lists ==> '+ toAddresses );

        // initialyse email
        
        EmailTemplate emailT =[SELECT id,name,HtmlValue,subject,description,Body FROM EmailTemplate where DeveloperName='RH_USER_RESET_PWD'];
         System.debug('add EmailTemplate ==> '+ emailT );
        Messaging.SingleEmailMessage mail = Messaging.renderStoredEmailTemplate(emailT.Id, userId, null);
        // mail.setTemplateId(emailT.Id);
        //Flag to false to stop inserting activity history
        mail.setSaveAsActivity(false);
        // mail.setTargetObjectId(userId);
        //This will not send email to account  
        mail.setTreatTargetObjectAsRecipient(false);
        // String tmpBody=emailT.Body;
        mail.setToAddresses(toAddresses);
        String subject=mail.getSubject();
        String htmlBody=mail.getHtmlBody();
        htmlBody = htmlBody.replace('$pass', (!String.isBlank(password)) ? password : '');
        htmlBody = htmlBody.replace('$urlToSend', (!String.isBlank(profilePage)) ? profilePage : '');
        
        String plainBody = mail.getPlainTextBody();
        plainBody = plainBody.replace('$pass', (!String.isBlank(password)) ? password : '');
        plainBody = plainBody.replace('$urlToSend', (!String.isBlank(profilePage)) ? profilePage : '');
        
        mail.setSubject(subject);
        mail.setHtmlBody(htmlBody);
        mail.setPlainTextBody(plainBody);
        // if(owea.size()>0) {
        //     mail.setOrgWideEmailAddressId(owea.get(0).Id);
        // }
        System.debug('mail var ' + mail.getSubject());
        Messaging.SendEmailResult[] results = Messaging.sendEmail(
                                 new Messaging.SingleEmailMessage[] { mail });
        
        // Call a helper method to inspect the returned results
        inspectResults(results);

        }catch (Exception ex) { 
            System.debug(' error occurred: ' + ex.getMessage());  
            throw ex;
        }
    }
    private static Boolean inspectResults(Messaging.SendEmailResult[] results) {
        Boolean sendResult = true;
        
        for (Messaging.SendEmailResult res : results) {
            if (res.isSuccess()) {
                System.debug('Email sent successfully');
            }
            else {
                sendResult = false;
                System.debug('The following errors occurred: ' + res.getErrors());                 
            }
        }
        
        return sendResult;
    }
}