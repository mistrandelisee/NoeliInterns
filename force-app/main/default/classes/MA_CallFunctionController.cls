public with sharing class MA_CallFunctionController {
    private static final String CONST_REQUEST_FUNCION = 'nl_manage_request';
    private static  String TOKEN ;
    public static  Boolean TOKEN_REQUIRED =true;
    static {
        TOKEN= TOKEN_REQUIRED ? getToken(): '';
       
    }

    static string getToken(){
        return [SELECT MA_Token__c FROM USER WHERE ID =: UserInfo.getUserId()].MA_Token__c;
        // return  'eyJhbGciOiJSUzI1NiIsImtpZCI6ImIyZGZmNzhhMGJkZDVhMDIyMTIwNjM0OTlkNzdlZjRkZWVkMWY2NWIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vcGxleGlmb3JtLWJlaW5nLTM4NDIxMSIsImF1ZCI6InBsZXhpZm9ybS1iZWluZy0zODQyMTEiLCJhdXRoX3RpbWUiOjE2OTAyMDc3OTksInVzZXJfaWQiOiI1Y3U5WlZpZU9EZVJVTmRWdXg0ZVp6emJkelIyIiwic3ViIjoiNWN1OVpWaWVPRGVSVU5kVnV4NGVaenpiZHpSMiIsImlhdCI6MTY5MDIwNzgwMywiZXhwIjoxNjkwMjExNDAzLCJlbWFpbCI6Im1pc3RyYW5kZWxpc2VlQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJtaXN0cmFuZGVsaXNlZUBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.okI_Y0bFeqzGC3cpLswchdCUzs-1c_VQrW09ezJI-W20Cjb0BNQwE2uLgoOdZB4PCaN5Rfpyu6VUZywqNab2mbtOOtYSlnE5IjmBEFx84LAbV5D8z-t3T7YcltKZ_wStmbs_rgBc90Xsj3LnL5WdBGyRZ5NLVKq1n_3vXbvm64SeuUQAJ3xV7qF0BD5XJORq5Jbn3E-fTVZPT_uEGyA9it58q4lx0OOV4TAc8kFFW7WJFK8EdP9QJvGOAEp7-IQ3L3GVLiza8TiOsuUL6neN2-vZl-PfdrMGRbmGRdrGUpbV5VFpdIfKQLZDZzF7o878lqOer6jfDwM4VHG3MvdLmw';
    }
    public MA_CallFunctionController() {

    }
    @AuraEnabled
    public static Map<String, Object> getRequests() {
        Map<String, Object> data = new Map<String, Object>{
            'action'=> 'GET-ALL'
        };
        return getData(CONST_REQUEST_FUNCION, data);
    }
    
    public static Map<String, Object> getData(String functionName, Map<String, Object> data) {
        Map<String, Object> mapReturn = new Map<String, Object>();
        try {
            HTTPResponse response = callFunction(functionName, data);
            if (response.getStatusCode() != 200) {
                throw new firebaseException(response.getBody(),'base');
            }else {
                // Deserialize the JSON string into collections of primitive data types.
                Map<String, Object> results = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                System.debug('results '+results);
                results=(Map<String, Object>) results.get('result');
                String exito = String.valueOf(results.get('exit'));  
                if (exito.equalsIgnoreCase('KO')) {
                    throw new firebaseException(JSON.serialize(results),'custom');
                }
                mapReturn.put('data', results.get('body'));
            }
        }
        catch(firebaseException e) {
            System.debug(e.getMessage()+': '+e.getStackTraceString());
            mapReturn.put('error', true);
            mapReturn.put('code', e.getCode());
            mapReturn.put('resfreshToken', e.resfreshToken);
            mapReturn.put('message', e.getMessage());
            mapReturn.put('_trace',e.getStackTraceString());
        }
        
        catch(Exception e) {
            System.debug(e.getMessage()+': '+e.getStackTraceString());
            mapReturn.put('error', true);
            mapReturn.put('message', e.getMessage());
            mapReturn.put('_trace',e.getStackTraceString());
        }

        
        System.debug(mapReturn);
        return mapReturn;
    }

    public static  HTTPResponse callFunction(String functionName, Map<String,Object> data) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        String My_Named_Credential =  'firebase';
        System.debug('token::::: ' + TOKEN +' TOKEN_REQUIRED '+TOKEN_REQUIRED);
        request.setHeader('Content-Type', 'application/json;odata=verbose');
        request.setHeader('Accept', 'application/json;odata=verbose');
        if (TOKEN_REQUIRED) {
            if(String.isBlank(TOKEN))
                TOKEN= getToken();
            request.setHeader('Authorization', 'Bearer '+TOKEN);
        }
        request.setEndpoint('callout:'+My_Named_Credential+'/'+functionName);
        request.setMethod('POST');
        request.setBody(JSON.serialize(new Map<String, Object>{'data'=>data}) );
        HttpResponse response = http.send(request);
        System.debug(request.getHeader('Authorization'));
        System.debug(response.getBody());
        return response;
    }
    private static final String UNAUTHENTICATED = 'UNAUTHENTICATED';
    public class firebaseException extends Exception {
        String message;
        String code;
        public boolean resfreshToken;
        override public String getMessage() {
            return message;
        }
        public String getCode() { return code; }

        firebaseException(String responseBody, string errortype){
            Map<String, Object> err = (Map<String, Object>) JSON.deserializeUntyped(responseBody);
            string codeKey='code';
            if(errortype=='base'){
                err=(Map<String, Object>) err.get('error');
                codeKey='status';
            }
            System.debug(err);

            this.message= String.valueOf(err.get('message')) ;
            this.code= String.valueOf(err.get(codeKey));
            this.resfreshToken = UNAUTHENTICATED.equalsIgnoreCase(code);
        }
    }
}