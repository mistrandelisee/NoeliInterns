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
        return [SELECT id,Name,Username,RH_ContactId__c,CommunityNickname FROM User WHERE Id=: userId AND isActive= True];
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
                                                                    //AND Id != :UserInfo.getUserId()
                                                                    AND isActive= True];
    }

    public User getUserInfoId() {
        return [Select Id, RH_ContactId__c,UserRole.Name From User where Id =: UserInfo.getUserId()];
    }
    public List<User> getIdUser(List<String> idUs) {
        return [Select Id,RH_ContactId__c,UserRole.Name From User Where RH_ContactId__c IN: idUs];
    }
    public List<User> getInfoUser(List<Id> conIds) {
        return [Select Id, RH_ContactId__c, UserRole.Name From User Where UserRole.Name =: 'Base User' And RH_ContactId__c IN:conIds];
    }
}