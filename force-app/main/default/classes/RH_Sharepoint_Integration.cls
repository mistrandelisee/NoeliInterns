public with sharing class RH_Sharepoint_Integration {
    public RH_Sharepoint_Integration() {

    }
    @AuraEnabled
    public static Map<String, Object> getData(String folderPath) {
        Map<String, Object> mapReturn = new Map<String, Object>();
        List<Object> Files = new List<Object>();
        try {
            HTTPResponse response = retrieveFiles(folderPath);
            if (response.getStatusCode() != 200) {
                mapReturn.put('error', true);
                mapReturn.put('body', response.getBody());
            }else {
                // Deserialize the JSON string into collections of primitive data types.
                Map<String, Object> results = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                // Cast the values in the 'animals' key as a list
                Map<String, Object> data = (Map<String, Object>) results.get('d');
                List<Object> filesInfo = (List<Object>) data.get('results');
                System.debug('Received the following filesInfo:');
                for(Object fileInfo: filesInfo) {
                    System.debug(fileInfo);
                    Files.add(fileInfo);
                }
            }
        } catch(Exception e) {
            System.debug(e.getMessage()+': '+e.getStackTraceString());
            mapReturn.put('error', true);
            mapReturn.put('body', e.getMessage()+': '+e.getStackTraceString());
        }
        mapReturn.put('Files', Files);
        return mapReturn;
    }

    public static  HTTPResponse retrieveFiles(String folderPath) {
        folderPath =  EncodingUtil.urlEncode(folderPath, 'UTF-8');
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        String My_Named_Credential =  'Sharepoint';
        request.setHeader('Content-Type', 'application/json;odata=verbose');
        request.setHeader('Accept', 'application/json;odata=verbose');
        request.setEndpoint('callout:'+My_Named_Credential+'/_api/web/GetFolderByServerRelativeUrl(\'/sites/ForceSite/Shared%20Documents/'+folderPath+'\')/Files');
        request.setMethod('GET');
        HttpResponse response = http.send(request);
        System.debug(response);
        // System.debug(response.getBody());
        // If the request is successful, parse the JSON response.
        
        return response;
    }
}