public with sharing class MA_UsersController {
    private static final String CONST_USER_FUNCION = 'nl_manage_users';
    static{
        MA_CallFunctionController.TOKEN_REQUIRED =true;
    }
    @AuraEnabled
    public static Map<String, Object> createUser(String userJson) {
        Map<String, Object> userData = (Map<String, Object>) JSON.deserializeUntyped(userJson);
        userData.put('createdDate', system.now().format());        
        Map<String, Object> data = new Map<String, Object>{
            'action'=> 'CREATE',
            'user'=> userData
        };
        return MA_CallFunctionController.getData(CONST_USER_FUNCION, data);
    }
    @AuraEnabled
    public static Map<String, Object> updateUser(String userId,String userJson) {
        Map<String, Object> userData = (Map<String, Object>) JSON.deserializeUntyped(userJson);
        userData.put('createdDate', system.now().format());        
        Map<String, Object> data = new Map<String, Object>{
            'action'=> 'UPDATE',
            'userId'=> userId,
            'user'=> userData
        };
        return MA_CallFunctionController.getData(CONST_USER_FUNCION, data);
    }
    @AuraEnabled
    public static Map<String, Object> getAdmins() {
        String ADMIN_ROLE='ADMIN';
        return getUsersByRole(ADMIN_ROLE);
    }
    @AuraEnabled
    public static Map<String, Object> getManagers() {
        String ADMIN_ROLE='MANAGER';
        return getUsersByRole(ADMIN_ROLE);
    }
    @AuraEnabled
    public static Map<String, Object> getAgents() {
        String ADMIN_ROLE='AGENT';
        return getUsersByRole(ADMIN_ROLE);
    }
    @AuraEnabled
    public static Map<String, Object> getClients() {
        String ADMIN_ROLE='CLIENT';
        return getUsersByRole(ADMIN_ROLE);
    }
    @AuraEnabled
    public static Map<String, Object> getAllUsers() {
        Map<String, Object> data = new Map<String, Object>{
            'action'=> 'GET-ALL'
        };
        return MA_CallFunctionController.getData(CONST_USER_FUNCION, data);
    }
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getUser(String userId) {
        Map<String, Object> data = new Map<String, Object>{
            'action'=> 'GET-INFO',
            'userId'=> userId
        };
        return MA_CallFunctionController.getData(CONST_USER_FUNCION, data);
    }
    @AuraEnabled
    public static Map<String, Object> getProfile() {
        Map<String, Object> data = new Map<String, Object>{
            'action'=> 'GET-PROFILE'
        };
        return MA_CallFunctionController.getData(CONST_USER_FUNCION, data);
    }
    @AuraEnabled
    public static Map<String, Object> getUsersByRole(String role) {
        Map<String, Object> data = new Map<String, Object>{
            'action'=> 'GET-ALL',
            'role'=> role
        };
        return MA_CallFunctionController.getData(CONST_USER_FUNCION, data);
    }
}