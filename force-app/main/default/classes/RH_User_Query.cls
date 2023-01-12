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
        // return [SELECT id,Name,Username,RH_ContactId__c,CommunityNickname FROM User WHERE Id=: userId AND isActive= True];
        return getUserInfoById(userId,true);
    }
    public List<User> getUserInfoById(String userId,Boolean isActive) {
        String query = 'SELECT id,Name,Username,RH_ContactId__c,isActive,CommunityNickname,Email  FROM User  ';
        String queryWHERE ='WHERE Id=: userId ';
        if(isActive != null){
			queryWHERE = queryWHERE + 'AND (isActive=: isActive) ';
		}
        query= query+queryWHERE;
        return Database.query(query);
    }

    private List<User> getUserByContactId(List<String> contactIds,Boolean isActive) {
        String query = 'SELECT id,Name,Username,RH_ContactId__c,isActive,CommunityNickname,Email  FROM User  ';
        String queryWHERE ='WHERE Profile.Name= :PROFILENAME AND RH_ContactId__c IN :contactIds ';
        if(isActive != null){
			queryWHERE = queryWHERE + 'AND (isActive=: isActive) ';
		}
        query= query+queryWHERE;
        return Database.query(query);
    }
    public List<User> getInfOfAllUsers(){
        return getUser();/*[SELECT id, Name,UserRole.Name,RH_ContactId__c FROM User WHERE (UserRole.Name='Human Resource Managment' 
                                                                        OR UserRole.Name='CEO' 
                                                                        OR UserRole.Name='Base User'
                                                                        OR UserRole.Name='RH Manager'
                                                                        OR UserRole.Name='Team Leader') AND isActive=True];*/
    }
    public List<User> getInfOfTeam(){
        return [SELECT id, Name,UserRole.Name,RH_ContactId__c FROM User WHERE UserRole.Name='Human Resource Managment' 
                                                                        OR UserRole.Name='CEO' 
                                                                        OR UserRole.Name='RH Manager'
                                                                        OR UserRole.Name='Team Leader'];
    }
    public List<User> getUser(){
        return [SELECT id, Name, Username,RH_ContactId__c,Email FROM User WHERE Profile.Name= :PROFILENAME AND isActive= True];
    }
    public List<User> getOtherUsers(){
        return [SELECT id, Name, Username,RH_ContactId__c,Email FROM User WHERE Profile.Name= :PROFILENAME AND Id != :UserInfo.getUserId() AND isActive= True];
    }
    public List<User> getUserByContactId(String contactId) {
        // return [SELECT id,Name,Username,RH_ContactId__c,isActive FROM User WHERE RH_ContactId__c=: contactId AND isActive= True];
        List<String> contactIds = new List<String>{contactId};
        return getUserByContactId(contactIds,true);
    }
    public List<User> getUserInfoByContactId(String contactId) {
        // return [SELECT id,Name,Username,RH_ContactId__c,isActive FROM User WHERE RH_ContactId__c=: contactId AND isActive= True];
        List<String> contactIds = new List<String>{contactId};
        return getUserByContactId(contactIds,null);
    }
    public List<User> getUserByContactId(List<Id> contactIds) {
        // return [SELECT id,Name,Username,RH_ContactId__c,isActive FROM User WHERE Profile.Name= :PROFILENAME AND RH_ContactId__c IN :contactIds AND isActive= True];
        return getUserByContactId(contactIds,true);
    }
    public List<User> getOtherUsersByContactIds(List<Id> contactIds) {
        return [SELECT id,Name,Username,RH_ContactId__c,Email FROM User WHERE Profile.Name= :PROFILENAME 
                                                                    AND RH_ContactId__c IN: contactIds 
                                                                    //AND Id != :UserInfo.getUserId()
                                                                    AND isActive= True];
    }

    public User getUserInfoId() {
        return [Select Id, RH_ContactId__c,UserRole.Name,LanguageLocaleKey From User where Id =: UserInfo.getUserId()];
    }
    public List<User> getIdUser(List<String> idUs) {
        return [Select Id,RH_ContactId__c,UserRole.Name From User Where RH_ContactId__c IN: idUs];
    }
    public List<User> getInfoUser(List<Id> conIds) {
        return [Select Id, RH_ContactId__c, UserRole.Name From User Where UserRole.Name =: 'Base User' And RH_ContactId__c IN:conIds];
    }
}