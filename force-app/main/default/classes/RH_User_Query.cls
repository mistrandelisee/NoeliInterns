public  class RH_User_Query {
    /** The class instance */
    private static RH_User_Query instance = null;
    public static String PROFILENAME = 'Custom Identity User';

    /**
     * @description @return the class instance
     */
    public static RH_User_Query getInstance() {

        if(instance == null) {

            instance = new RH_User_Query();
        }
        return instance;
    }

    public List<User> getUserById(String userId) {
        return [SELECT id,Name,Username,RH_ContactId__c FROM User WHERE Id=: userId AND isActive= True];
    }
    public List<User> getUser(){
        return [SELECT id, Name, Username,RH_ContactId__c FROM User WHERE Profile.Name= :PROFILENAME AND isActive= True];
    }
    public List<User> getOtherUsers(){
        return [SELECT id, Name, Username,RH_ContactId__c FROM User WHERE Profile.Name= :PROFILENAME AND Id != :UserInfo.getUserId() AND isActive= True];
    }
    public List<User> getUserByContactId(String contactId) {
        return [SELECT id,Name,Username,RH_ContactId__c FROM User WHERE RH_ContactId__c=: contactId AND isActive= True];
    }
    public List<User> getUserByContactId(List<Id> contactIds) {
        return [SELECT id,Name,Username,RH_ContactId__c FROM User WHERE Profile.Name= :PROFILENAME AND RH_ContactId__c IN :contactIds AND isActive= True];
    }
    public List<User> getOtherUsersByContactIds(List<Id> contactIds) {
        return [SELECT id,Name,Username,RH_ContactId__c FROM User WHERE Profile.Name= :PROFILENAME 
                                                                    AND RH_ContactId__c IN: contactIds 
                                                                    AND Id != :UserInfo.getUserId()
                                                                    AND isActive= True];
    }
}