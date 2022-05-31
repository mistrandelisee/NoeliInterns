public class RH_FileUploader {
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
        
        List<ContentDistribution> ctDistrib = [ SELECT Id,Name,ContentDownloadUrl,ContentVersionId,ContentDocumentId FROM ContentDistribution WHERE ContentVersionId IN :ctVerId ];
        
        Map<String, Object> fileData = new Map<String, Object>{
            'data'=> ctDistrib
        };
       
       return  fileData;
    }
    
    
    public static Map<String,Object> updateFile(String base64, String filename, String ContentVersionId) {
        ContentVersion ctVer = updateContentVersion(base64, filename,ContentVersionId);
        ContentDistribution ctDistribution = updateContentDistribution(filename,ContentVersionId);
        return  new Map<String,Object>{
            'ContentVersion'=> ctVer,
            'ContentDistribution'=> ctDistribution
        };
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