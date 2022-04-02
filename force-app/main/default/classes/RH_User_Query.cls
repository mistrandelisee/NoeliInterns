public  class RH_User_Query {
    /** The class instance */
    private static RH_User_Query instance = null;

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
}
