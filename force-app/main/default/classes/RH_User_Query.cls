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
        return [SELECT id,Name,Username,RH_ContactId__c FROM User WHERE Id=: userId ];
    }
    public List<User> getUser(){
        return [SELECT id, Name, Username,RH_ContactId__c FROM User WHERE Profile.Name= :PROFILENAME];
    }
    public List<User> getUserByContactId(String contactId) {
        return [SELECT id,Name,Username,RH_ContactId__c FROM User WHERE RH_ContactId__c=: contactId ];
    }
}