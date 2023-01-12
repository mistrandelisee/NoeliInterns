public class RH_FileUploader {
    private static RH_News_Query newsQry = RH_News_Query.getInstance();

    @AuraEnabled
    public static Attachment attachFile(String base64,String filename, String recordId) {
        Blob fileBlob = EncodingUtil.base64Decode(base64);
        Attachment att=new Attachment();
        att.Body=fileBlob;
        att.Name= filename;
        att.parentId=recordId;
        try {
            insert att;
            return att; 
        } catch(DMLException e) {
            System.debug(e);
            return null;
        }
       
    } 
    /*List<ContentDistribution> cds = new List<ContentDistribution>();
    List<ContentDocument> cvs = new List<ContentDocument>();
    for (ContentDistribution con : [SELECT Id,ContentVersionId
,    ContentDocumentId, Name
    FROM ContentDistribution]) {
        cvs.add(new ContentDocument(Id=con.ContentDocumentId));
        cds.add(new ContentDistribution(Id=con.Id));
    }
    delete cds;
    delete cvs;*/
    
    
    public static String uploadFile(String base64, String filename, String recordId) {
        ContentVersion cv = createContentVersion(base64, filename);
        ContentDocumentLink cdl = createContentLink(cv.Id, recordId);
        return  createDistribution(cv.Id, filename);
    }
    
    /**
     * Description: Create new content version. for the request 
     */
    private static ContentVersion createContentVersion(String base64, String filename) {
        ContentVersion cv = new ContentVersion();
        cv.VersionData = EncodingUtil.base64Decode(base64);
        cv.Title = filename;
        cv.PathOnClient = filename;
        cv.IsMajorVersion = false;
        cv.SharingOption ='A';
        //cv.SharingPrivacy = 'P';
        cv.origin = 'H';
        insert cv;
        return cv;
    }
    private static String createDistribution(String contentVersionId, String filename) {
        ContentDistribution cd = new ContentDistribution();
        cd.Name = filename;
        cd.ContentVersionId = contentVersionId;
        cd.PreferencesAllowViewInBrowser= true;
        cd.PreferencesLinkLatestVersion=true;
        cd.PreferencesNotifyOnVisit=false;
        cd.PreferencesPasswordRequired=false;
        cd.PreferencesAllowOriginalDownload= true;
        
        if (!Test.isRunningTest()) {
           insert cd;
           return  [SELECT Id,Name,ContentDownloadUrl,PdfDownloadUrl,ContentVersionId  FROM ContentDistribution WHERE Id = :cd.Id ORDER BY CreatedDate DESC].ContentDownloadUrl;
        }
        
        return '';
    }
    private static ContentDocumentLink createContentLink(String contentVersionId, String recordId) {
        ContentDocumentLink cdl = new ContentDocumentLink();
        cdl.ContentDocumentId = [ SELECT ContentDocumentId FROM ContentVersion WHERE Id =: contentVersionId ].ContentDocumentId;
        cdl.LinkedEntityId = recordId;
        cdl.ShareType = 'V';
        cdl.Visibility ='AllUsers';
        insert cdl;
        return cdl;
    }
    
    @AuraEnabled
    public static Map<String,Object> getFileInfos(String recordId) {      
        List<ContentDocumentLink> ctDoc = [ SELECT Id,LinkedEntityId,ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId =: recordId];
        List<ID> ctDocId = new List<ID>();
        for (ContentDocumentLink docLink : ctDoc) {
            ctDocId.add(docLink.ContentDocumentId);
        }
 		
        List<ContentVersion> ctVer = [ SELECT Id FROM ContentVersion WHERE ContentDocumentId IN :ctDocId ];
        List<ID> ctVerId = new List<ID>();
        for (ContentVersion version : ctVer) {
            ctVerId.add(version.Id);
        }

        List<ContentDocument> ContntDocmnt = [SELECT Id, Title, FileType FROM ContentDocument WHERE Id IN : ctDocId];

        List<ContentDistribution> ctDistrib = [ SELECT Id,Name,ContentDownloadUrl,ContentVersionId,ContentDocumentId FROM ContentDistribution WHERE ContentVersionId IN :ctVerId ];
        
        Map<String, Object> fileData = new Map<String,Object>{
            'data'=> ctDistrib,
            'data2' => ContntDocmnt
        };
       
       return  fileData;
    }
    
    
    public static Map<String,Object> updateFiles(String base64, String filename, String ContentVersionId) {
        ContentVersion ctVer = updateContentVersion(base64, filename,ContentVersionId);
        ContentDistribution ctDistribution = updateContentDistribution(filename,ContentVersionId);
        return  new Map<String,Object>{
            'ContentVersion'=> ctVer,
            'ContentDistribution'=> ctDistribution
        };
    }


    public static String updateFile(String base64, String filename, String recordId) {
        Savepoint savept = Database.setSavepoint();
 

          try{
            boolean isDelete= deleteFiles(recordId);
            system.debug(' record is delete value: '+ isDelete);
            if(isDelete==true){
              String linkFile= uploadFile(base64 ,filename ,recordId); 

              if(String.isNotBlank(linkFile) ){
                News__c record= newsQry.getNewsById(recordId);
                system.debug(' record before update : '+ record);
                record.Image__c=linkFile;
                update record;
                system.debug(' record after  update : '+ record);
              }

              system.debug(' link of file:  '+ linkFile);
              return linkFile;
            }

            return null;
           }
 

          catch( Exception e ){
             Database.rollback( savept );
             system.debug(' error  file exception:  '+ e);
             return null;
           }
    }



    
    private static ContentVersion updateContentVersion(String base64, String filename,String ContentVersionId) {
        ContentVersion ctVer = [ SELECT Id,Title,VersionData FROM ContentVersion WHERE Id =: ContentVersionId ];
        ctVer.VersionData = EncodingUtil.base64Decode(base64);
        ctVer.Title = filename;
        update ctVer;
        return ctVer;
    }

    private static ContentDistribution updateContentDistribution(String filename,String ContentVersionId) {
        ContentDistribution ctDistribution = [  SELECT Id,Name FROM ContentDistribution WHERE ContentVersionId =:ContentVersionId ];
        ctDistribution.Name = filename;
        update ctDistribution;
        return ctDistribution;
    }


    @AuraEnabled
    public static Boolean deleteFiles(String recordId){
        try{
            Map<String,Object>  fileDetail = getFileInfos(recordId);
            List<ContentDistribution> ctDistrib = (List<ContentDistribution>) fileDetail.get('data');
            List<ContentDocument> ctDoc = (List<ContentDocument>)fileDetail.get('data2');
    
            if(!ctDistrib.isEmpty() && ctDistrib != null) {
                Database.delete(ctDistrib, false);
            }
    
            if(!ctDoc.isEmpty() && ctDoc != null) {
                Database.delete(ctDoc, false);
            }
    
            return true;
        }catch(Exception e) {
            System.debug('echec Delete File : ' + e.getMessage());
            return null;
        }  
      
    }

    @AuraEnabled
    public static void deleteFile(String recId, String docId){
        list<ContentDocument> lstCntDocsToDelete = new list<ContentDocument>();
        for(ContentDocumentLink iterator : [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId =: recId And ContentDocumentId=: docId]) {
            lstCntDocsToDelete.add(new ContentDocument(Id = iterator.ContentDocumentId));
        }
        if(!lstCntDocsToDelete.isEmpty() && lstCntDocsToDelete != null) {
            Database.delete(lstCntDocsToDelete, false);
            Database.emptyRecycleBin(lstCntDocsToDelete);
        }
    }

    
    
    
    
}