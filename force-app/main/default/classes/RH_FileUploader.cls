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
        cv.IsMajorVersion = true;
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
            return  [SELECT Id,ContentDownloadUrl,PdfDownloadUrl,ContentVersionId  FROM ContentDistribution WHERE Id = :cd.Id ORDER BY CreatedDate DESC].ContentDownloadUrl;
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
}