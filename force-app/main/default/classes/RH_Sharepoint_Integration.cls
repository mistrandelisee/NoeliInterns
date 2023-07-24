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

        /**
     * @description       : 
     * @author            : Evariste
     * @group             : 
     * @last modified on  : 20-02-23
     * @last modified by  : Evariste 
     * Modifications Log
     * Ver   Date         Author     Modification
     * 1.0   10-02-2023   Evariste   Initial Version
    **/
     @AuraEnabled
     public static map<String,Object> PostFolder (String folderPath){

        map<String,Object> mapResult = new  map<String,Object>();
        HTTPResponse res = createFolder(folderPath);
        if (res.getStatusCode() !=201) {
            mapResult.put('error', true);
            mapResult.put('body', 'error when upload');
        }else {
            mapResult.put('body', res.getBody());
        }
        return mapResult;
     }
      
      public static HTTPResponse createFolder(String folderPath){

        folderPath =  EncodingUtil.urlEncode(folderPath, 'UTF-8');
        BodyCreateFolder folder = new BodyCreateFolder();
        folder.ServerRelativeUrl = 'https://noeliit.sharepoint.com/sites/ForceSite/Shared%20Documents/'+folderPath;
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        String My_Named_Credential =  'Sharepoint';
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json;odata=verbose');
        request.setEndpoint('callout:'+My_Named_Credential+'/_api/web/folders');
        request.setMethod('POST');
        request.setBody(JSON.serialize(folder));

        HttpResponse response = http.send(request);
        return response;
           
      }

      @AuraEnabled
      public static Boolean VerifyFolderRoot(String NameObject){
        HTTPResponse resp = createFolder(NameObject);
        if (resp.getStatusCode() !=201) {
            System.debug(resp.getBody());
        }
        return false;

      }


      @AuraEnabled
      public static map<String,Object> PostFile (String folderPath , String base64,string folderName){
 
         map<String,Object> mapResult = new  map<String,Object>();
         HTTPResponse res = createFile(folderPath,base64,folderName);
         if (res.getStatusCode() !=200) {
             mapResult.put('error', true);
             mapResult.put('body', 'create File did not succeed');
             System.debug('@@@@body'+res.getBody());

         }else {
             mapResult.put('body', res.getBody());
             System.debug('@@@@body'+res.getBody());
         }
         return mapResult;
      }
       
       public static HTTPResponse createFile(String folderPath , String base64,string folderName) {
        
        Blob content= EncodingUtil.base64Decode(base64);
        System.debug('@@@@content'+content);
        System.debug('@@@@base64'+base64);
        folderPath =  EncodingUtil.urlEncode(folderPath, 'UTF-8');
        folderName =  EncodingUtil.urlEncode(folderName, 'UTF-8');
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        String My_Named_Credential =  'Sharepoint';
        request.setHeader('Content-Type', 'application/octet-stream');
        request.setHeader('Accept', 'application/json;odata=verbose');
        request.setEndpoint('callout:'+My_Named_Credential+'/_api/web/GetFolderByServerRelativeUrl(\'Shared%20Documents/'+folderPath+'\')/Files/add(url=\''+folderName+'\',overwrite=true)');
        request.setMethod('POST');
        request.setBodyAsBlob(content);

        HttpResponse response = http.send(request);
        return response;
      }

      public static HttpResponse DeleteFolderAPI(String folderPath) {
       
        folderPath =  EncodingUtil.urlEncode(folderPath, 'UTF-8');
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        String My_Named_Credential =  'Sharepoint';
        request.setHeader('If-Match', '{etag or *}');
        request.setHeader('X-HTTP-Method', 'DELETE');
        request.setHeader('Content-Length', '0');
        request.setEndpoint('callout:'+My_Named_Credential+'/_api/web/GetFolderByServerRelativeUrl(\'Shared%20Documents/'+folderPath+'\')');
        request.setMethod('POST');

        HttpResponse response = http.send(request);
        return response;
        
      }

      @AuraEnabled
      public static map<String,Object> DeleteFolder (String folderPath){
 
         map<String,Object> mapResult = new  map<String,Object>();
         HTTPResponse res = DeleteFolderAPI(folderPath);
         if (res.getStatusCode() !=200) {
             mapResult.put('error', true);
             mapResult.put('body', 'Folder did not deleted');
             System.debug('@@@@response deleted failed'+res.getBody());

         }else {
             mapResult.put('body', res.getBody());
             System.debug('@@@@response deleted pass'+res.getBody());
         }
         return mapResult;
      }

    @AuraEnabled
    public static String  uploadchunckMethod(String folderPath,String Content,String fileName,Boolean IsFirst,Boolean IsMiddle,Boolean IsLast){

        string guidId= '891211a1-c680-4dcf-b762-cd87e886444a';
        String Result = null;
        Http http = new Http();
        Blob blobCon= EncodingUtil.base64Decode(Content);
        // folderPath =  EncodingUtil.urlEncode(folderPath, 'UTF-8');
        // fileName =  EncodingUtil.urlEncode(fileName, 'UTF-8');
        String My_Named_Credential =  'Sharepoint';
        HttpRequest request = new HttpRequest();
        request.setHeader('Content-Type', 'application/octet-stream');
        request.setHeader('Accept', 'application/json;odata=verbose');
        request.setMethod('POST');
        request.setBodyAsBlob(blobCon);
        if (IsFirst) {
            request.setEndpoint('callout:'+My_Named_Credential+'/_api/web/GetFolderByServerRelativeUrl(\'Shared%20Documents/'+folderPath+'/'+fileName+'\')/startupload(uploadId=guid\'891211a1-c680-4dcf-b762-cd87e886444g\')');
            HttpResponse response = new HttpResponse();
            response = http.send(request);
            System.debug('@@@@@@response '+response);
            System.debug('@@@@@@responsegetBody() '+response.getBody());
        }else if (IsMiddle) {
            System.debug('@@@Middle Upload ');
        }else if (IsLast) {
            System.debug('@@@Finish Upload ');
        }
        return 'value';
      }


    class BodyCreateFolder{
    
        @AuraEnabled public String ServerRelativeUrl;
    }

}