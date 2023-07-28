public with sharing class MA_RequestController {
    private static final String CONST_REQ_FUNCION = 'nl_manage_request';
    static{
        MA_CallFunctionController.TOKEN_REQUIRED =true;
    }
    /*
    @AuraEnabled
    public static Map<String, Object> createtransfert(String transfertJson) {
        Map<String, Object> transfertData = (Map<String, Object>) JSON.deserializeUntyped(transfertJson);
        transfertData.put('createdDate', system.now().format());        
        Map<String, Object> data = new Map<String, Object>{
            'action'=> 'CREATE',
            'transfert'=> transfertData
        };
        return MA_CallFunctionController.getData(CONST_REQ_FUNCION, data);
    }*/
    @AuraEnabled
    public static Map<String, Object> updateRequest(String transfertId,String transfertJson) {
        Map<String, Object> transfertData = (Map<String, Object>) JSON.deserializeUntyped(transfertJson);
        // transfertData.put('createdDate', system.now().format());        
        Map<String, Object> data = new Map<String, Object>{
            'action'=> 'UPDATE',
            'transfertId'=> transfertId,
            'transfert'=> transfertData
        };
        return MA_CallFunctionController.getData(CONST_REQ_FUNCION, data);
    }
    
   
    @AuraEnabled
    public static Map<String, Object> getAlltransferts() {
        Map<String, Object> data = new Map<String, Object>{
            'action'=> 'GET-ALL'
        };
        return MA_CallFunctionController.getData(CONST_REQ_FUNCION, data);
    }
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getTransfert(String transfertId) {
        Map<String, Object> data = new Map<String, Object>{
            'action'=> 'GET-INFO',
            'transfertId'=> transfertId
        };
        return MA_CallFunctionController.getData(CONST_REQ_FUNCION, data);
    }
}