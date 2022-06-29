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
    public static List<NewsWrapper>  getActiveNews() {

        String currentLang= UserInfo.getLanguage();
        List<News__c> actNews=  newsQry.getActiveNews();

        List<NewsWrapper> newsToview = new List<NewsWrapper>();

        for(News__c  ns : actNews) {

            switch on currentLang {
                when 'it' {
                    if( String.isNotBlank(ns.TitleIt__c)&&  String.isNotBlank(ns.DescriptionIt__c) ){
                        NewsWrapper  newView= new NewsWrapper( ns.Id, ns.TitleIt__c, ns.DescriptionIt__c, ns.Image__c, ns.IsActive__c);
                        newsToview.add(newView); 
                    }
                     
                }
                
                when 'fr' {
                    if( String.isNotBlank(ns.TitleFr__c)&&  String.isNotBlank(ns.DescriptionFr__c) ){
                        NewsWrapper  newView= new NewsWrapper( ns.Id, ns.TitleFr__c, ns.DescriptionFr__c, ns.Image__c, ns.IsActive__c);  
                        newsToview.add(newView);  
                    }
                        
                }
                when 'en_US' {
                    if( String.isNotBlank(ns.TitleEn__c)&&  String.isNotBlank(ns.DescriptionEn__c) ){
                        NewsWrapper  newView= new NewsWrapper( ns.Id, ns.TitleEn__c, ns.DescriptionEn__c, ns.Image__c, ns.IsActive__c);    
                        newsToview.add(newView);
                    }
                      
                }
            }
                
        }
        System.debug('&&&&&& newsToview ends  ' + newsToview);

        return newsToview;
        
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
    public static  List<NewsWrapper> filterNews( String name,String description, Boolean isactive) {
        Map<string,object> UserRole= RH_Utility.checkRole();
        String currentLang= UserInfo.getLanguage();
        List<News__c> actNews = new List<News__c>();

        Boolean isBaseUser= (Boolean) UserRole.get('isBaseUser'); 
        if(isBaseUser){
            actNews= newsQry.filterNews(name, description, true); 
        }else {
            actNews= newsQry.filterNews(name, description, isactive); 
        }

        List<NewsWrapper> newsToview = new List<NewsWrapper>();

        for(News__c  ns : actNews) {

            switch on currentLang {
                when 'it' {
                    if( String.isNotBlank(ns.TitleIt__c)&&  String.isNotBlank(ns.DescriptionIt__c) ){
                        NewsWrapper  newView= new NewsWrapper( ns.Id, ns.TitleIt__c, ns.DescriptionIt__c, ns.Image__c, ns.IsActive__c);
                        newsToview.add(newView); 
                    }
                     
                }
                
                when 'fr' {
                    if( String.isNotBlank(ns.TitleFr__c)&&  String.isNotBlank(ns.DescriptionFr__c) ){
                        NewsWrapper  newView= new NewsWrapper( ns.Id, ns.TitleFr__c, ns.DescriptionFr__c, ns.Image__c, ns.IsActive__c);  
                        newsToview.add(newView);  
                    }
                        
                }
                when 'en_US' {
                    if( String.isNotBlank(ns.TitleEn__c)&&  String.isNotBlank(ns.DescriptionEn__c) ){
                        NewsWrapper  newView= new NewsWrapper( ns.Id, ns.TitleEn__c, ns.DescriptionEn__c, ns.Image__c, ns.IsActive__c);    
                        newsToview.add(newView);
                    }
                      
                }
            }
                
        }
        System.debug('filterNews &&&&&& newsToview ends  ' + newsToview);

        return newsToview;
   
    }
    @AuraEnabled
    public static String  updateFile(String base64, String filename, String recordId) {
        return RH_FileUploader.updateFile(base64, filename, recordId);
    }

    @AuraEnabled
    public static List<News__c> getAllNews() {
        Map<string,object> UserRole= RH_Utility.checkRole();

        Boolean isBaseUser= (Boolean) UserRole.get('isBaseUser'); 
        if(isBaseUser){
            return newsQry.getActiveNews();
        }else {
            return newsQry.getAllNews();
        }
        
    }
    
      @AuraEnabled 
    public static Map<String,Object>  getNewsDetails(String recordId){
        String currentLang= UserInfo.getLanguage();
        News__c currentNews= newsQry.getNewsById(recordId);

        Map<String,Object> newsDetail = new Map<String,Object>{
            'Lang'=> currentLang,
            'News' => currentNews
        };
       
        return newsDetail;   
    }
    
     @AuraEnabled 
    public static News__c updateNewsVisibility(String recordId,boolean enabled){
        News__c news = newsQry.getNewsById(recordId);
        news.IsActive__c=enabled;
        
        update news;
        
        return newsQry.getNewsById(recordId);   
    }
    
    @AuraEnabled 
    public static News__c updateNews(String recordId, String newsJson, String currentLang){
         try {
            News__c news = (News__c)JSON.deserialize(newsJson,News__c.class);
            news.Id=recordId;
            
            String cLang=currentLang;
            if(String.isEmpty(cLang)){
                 cLang= UserInfo.getLanguage();
            }
            
            switch on cLang {
                when 'it' {
                    news.DescriptionIt__c= news.Description__c;
                    news.TitleIt__c = news.Name;
                }
                
                when 'fr' {
                    news.DescriptionFr__c= news.Description__c;
                    news.TitleFr__c = news.Name;       
                }
                when 'en_US' {
                    news.DescriptionEn__c= news.Description__c;
                    news.TitleEn__c = news.Name;     
                }
            }

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
         system.debug('This is our org part : '+orgPart);
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
            NewsWrapper news = (NewsWrapper)JSON.deserialize(newsJson,NewsWrapper.class);
            String currentLang= UserInfo.getLanguage();

            News__c newIns= new News__c();
            switch on currentLang {
                when 'it' {
                    newIns.DescriptionIt__c= news.description;
                    newIns.TitleIt__c = news.name;
                }
                
                when 'fr' {
                    newIns.DescriptionFr__c= news.description;
                    newIns.TitleFr__c = news.name;       
                }
                when 'en_US' {
                    newIns.DescriptionEn__c= news.description;
                    newIns.TitleEn__c = news.name;     
                }
            }

            newIns.Name = news.name;
            newIns.Description__c = news.description;
            newIns.IsActive__c = news.isActive;
            
            insert newIns;
            System.debug(' newIns : ' + newIns);
            System.debug(' News : ' + news);
            return newIns;
            
        } catch(Exception e) {
            System.debug('echec Insertion ' + e.getMessage());
            //return false;
        } 
        return null;
    }

    @AuraEnabled 
    public static Boolean deleteNews(String recordId){
        try {
            News__c newDetail = newsQry.getNewsById(recordId);
            delete newDetail;
            Boolean del= RH_FileUploader.deleteFiles(recordId);
            if(del){
                return true;
            }
            return null;
            
        } catch(Exception e) {
            System.debug('echec Insertion ' + e.getMessage());
            return null;
        } 
    }
    
    public class configuration{
        String interval;
        String numberOfNews; 
    }

    public class NewsWrapper{
        @AuraEnabled  public  Boolean isActive { get; set;}
        @AuraEnabled  public  String description { get; set;}
        @AuraEnabled  public String name { get; set;}
        @AuraEnabled  public String image { get; set;}
        @AuraEnabled  public String id { get; set;}

        public NewsWrapper (){}

        public NewsWrapper ( String id, String name,   String description, String image, Boolean isActive ){
            this.id  = id;
            this.isActive  = isActive;
            this.description = description;
            this.name = name;
            this.image = image;
        }
    }    
    
}