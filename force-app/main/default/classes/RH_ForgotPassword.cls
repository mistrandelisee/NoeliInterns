public with sharing class RH_ForgotPassword {
    public RH_ForgotPassword() {

    }
    @AuraEnabled
    public static User forgotPassword(String userName){
        try {
            User userP = [SELECT Id, Username,Email, Password__c FROM User WHERE Username=:userName AND isActive=true LIMIT 1];
            
            Map<String, Object> emailInputMap = new  Map<String, Object>{
                'userId'=> userP.Id,
                'Password'=> generateRandomString(10)
            };
                System.setPassword(userP.Id, string.valueOf(emailInputMap.get('Password')));  
                   
                RH_Emails_Utility.sendUserResetPassword(emailInputMap);
                return userP;   

        } catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
            
        }
   
    }

    public static String generateRandomString(Integer len) {
        final String chars = 'xaxPmno2IDdEwLzbtEvhv6oG1RDT6xQJX3MvF4amaDQ9TUvHgJfdbodlllPTnnuw1234567890';
        String randStr = '';
        while (randStr.length() < len) {
            Integer idx = Math.mod(Math.abs(Crypto.getRandomInteger()), chars.length());
            randStr += chars.substring(idx, idx+1);
        }
        return randStr;
    }
}