public without sharing class RH_Logs_Utility {

    public static final  RH_Settings__c cs = RH_Settings__c.getOrgDefaults();
    public static boolean saveLogs = cs.NL_SaveLogs__c;
    private static final Integer STR_LENGTH = 130999;
    
    public static List<NL_Logs__c> saveLogs(List<NL_Logs__c> logs){
        Boolean toInsert= saveLogs!=null && saveLogs ;
        if (saveLogs) {
            insert logs;
        }
        return logs;
    }

    public static NL_Logs__c writeLog(String request, String response, String dirCom, String service, Boolean error, List<String> sistemi, Boolean soap, String IdRecord) {
        Boolean toInsert= saveLogs!=null && saveLogs ;
        return createLog(toInsert, request, response, dirCom, service, error, sistemi, soap, IdRecord);
    }
    public static NL_Logs__c prepareLog(String request, String response, String dirCom, String service, Boolean error, List<String> sistemi, Boolean soap, String IdRecord) {

        return createLog(false, request, response, dirCom, service, error, sistemi, soap, IdRecord);
    }
    private static NL_Logs__c createLog(boolean toInsert,String request, String response, String dirCom, String service, Boolean error, List<String> sistemi, Boolean soap, String IdRecord) {

        NL_Logs__c log = new NL_Logs__c();

        //if(soap) request = (String)JSON.deserializeUntyped(request);
        if(request.length()>STR_LENGTH)  log.NL_Request__c = request.substring(0, STR_LENGTH);
        else log.NL_Request__c = request;
        
        if(response.length()>STR_LENGTH) log.NL_Responce__c = response.substring(0, STR_LENGTH);
        else log.NL_Responce__c = response;
        
        log.NL_CommunicationDirection__c = dirCom;
		log.NL_Service__c = service;
		log.NL_RecordId__c = IdRecord;

        log.NL_Sytems__c = (sistemi.isEmpty()) ? '' : String.join(sistemi, ',');

        if(error) log.NL_Error__c = true;

        if(soap == true) {
            log.NL_Communication__c = 'SOAP';
        } else {
            log.NL_Communication__c = 'REST';
        }
        System.debug('###########log > ' + log);
        if (toInsert) {
            insert log;
        }
        return log;
    }

}