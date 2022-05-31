public class RH_News_controller {
    private static RH_News_Query newsQry = RH_News_Query.getInstance();
/*
    @AuraEnabled
    public static Map<String, Object> getActiveNews() {
        List<News__c> listNews = newsQry.getActiveNews();
		Set<Id> resultIds = (new Map<Id,News__c>(listNews)).keySet();
        // Attachment  listAttachements = new Attachment();
       List<Attachment>  listAttachement =  [ SELECT Id,Name,Body,ContentType,ParentId FROM Attachment  WHERE ParentId IN :resultIds ];
        Map<Id, News__c> listMap = new Map<Id, News__c>(listNews); 
       Map<Id, Attachment> attachMap = new Map<Id, Attachment>
       ([select Id,Name, ParentId, Body,ContentType from Attachment where ParentId in : resultIds]);
       	
        Map<String,String> ListBase64 = new Map<String,String>{};
        for(Attachment att: listAttachement ){
            String body= EncodingUtil.base64Encode(att.Body);
            ListBase64.put(att.ParentId, att.Name+','+body);
            System.debug(body);
        }
        Map<String, Object> result = new Map<String, Object>{
            'News'=> listNews,
            'ListBase64'=>ListBase64
        };
        
        return result;
    }*/
    
    @AuraEnabled
    public static List<News__c> getActiveNews() {
        return newsQry.getActiveNews();
    }
    
    
    @AuraEnabled 
    public static Map<String,Object>  uploadFile(String base64, String filename, String recordId){
        Map<String, Object> mapReturn = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            String newsImage=RH_FileUploader.uploadFile(base64, filename, recordId);
            update new News__c(Id=recordId,Image__c=newsImage);

            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    }
    
    @AuraEnabled
    public static Map<string,Object> updateFile(String base64, String filename, String ContentVersionId) {
        return RH_FileUploader.updateFile(base64, filename, ContentVersionId);
    }

    @AuraEnabled
    public static List<News__c> getAllNews() {
        return newsQry.getAllNews();
    }
    
      @AuraEnabled 
    public static News__c getNewsDetails(String recordId){
        return newsQry.getNewsById(recordId);   
    }
    
     @AuraEnabled 
    public static News__c updateNewsVisibility(String recordId,boolean enabled){
        News__c news = newsQry.getNewsById(recordId);
        news.IsActive__c=enabled;
        
        update news;
        
        return newsQry.getNewsById(recordId);   
    }
    
    @AuraEnabled 
    public static News__c updateNews(String recordId, String newsJson){
         try {
            News__c news = (News__c)JSON.deserialize(newsJson,News__c.class);
            news.Id=recordId;
            update news;
            System.debug('Update News ' + news);
            return news;
            
        } catch(Exception e) {
            System.debug('echec Update ' + e.getMessage());
            return null;
        }    
    }
    
     // get the datas in  default partition
    @AuraEnabled
    public static map<String, String>  getOrgConfig(){
         Cache.OrgPartition orgPart = Cache.Org.getPartition('local.RHCommunity');
 		 if (orgPart.contains('configuration')) {
            map<String, String> cachedConfig = (map<String, String>)orgPart.get('configuration');
            System.debug('RH_News_controller.getConfigData '+ cachedConfig);
            
             return cachedConfig;
        }
        return null;  
    }
    
    // set the datas in  default partition
    @AuraEnabled
    public static map<String, String> setOrgConfig(String data){ 
        configuration param = (configuration)JSON.deserialize(data, configuration.class);
        
        map<String, String> setting= new map<String, String>{
            'interval' => param.interval,
            'numberOfNews' => param.numberOfNews
        };
        // get default partition
        Cache.OrgPartition orgPart = Cache.Org.getPartition('local.RHCommunity');
        // add data
        orgPart.put('configuration', setting);
        map<String, String> cachedConfig = (map<String, String>)orgPart.get('configuration');
        
        system.debug('@@@@@ org '+ cachedConfig);
        
        
        return cachedConfig;  
    }
    
     @AuraEnabled 
    public static News__c newsCreation(String newsJson){
        try {
            News__c news = (News__c)JSON.deserialize(newsJson,News__c.class);
            insert news;
            System.debug('echec News ' + news);
            return news;
            
        } catch(Exception e) {
            System.debug('echec Insertion ' + e.getMessage());
            //return false;
        } 
        return null;
    }
    
    public class configuration{
        String interval;
        String numberOfNews; 
    }
    
    
}