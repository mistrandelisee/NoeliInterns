public class RH_News_Query {

     /** The class instance */
     private static RH_News_Query instance = null;

     /**
      * @description @return the class instance
      */
     public static RH_News_Query getInstance() {
 
         if(instance == null) {
             instance = new RH_News_Query();
         }
         return instance;
     }
 

    public List<News__c> getActiveNews() {
        return [SELECT Id, Name, Description__c,IsActive__c,Image__c,DescriptionEn__c,DescriptionFr__c,DescriptionIt__c,TitleEn__c,TitleFr__c,TitleIt__c FROM News__c WHERE IsActive__c = TRUE order by LastModifiedDate DESC];
    }
    
    public List<News__c> getAllNews() {
        return [SELECT  Id, Name, Description__c,IsActive__c,Image__c,DescriptionEn__c,DescriptionFr__c,DescriptionIt__c,TitleEn__c,TitleFr__c,TitleIt__c FROM News__c order by LastModifiedDate DESC];
    }

    public News__c getNewsById(String recordId){
        List<News__c> newsList= [SELECT Id, Name, Description__c,IsActive__c,Image__c,DescriptionEn__c,DescriptionFr__c,DescriptionIt__c,TitleEn__c,TitleFr__c,TitleIt__c FROM News__c WHERE Id =: recordId ];
        return newsList[0] ;
    }

    public List<News__c> filterNews(String searchText, String name,String description, Boolean isactive){
        String currentLang= UserInfo.getLanguage();
        List<String> condition= new List<String>() ;
        
        String query= 'SELECT  Id, Name, Description__c,IsActive__c,Image__c,DescriptionEn__c,DescriptionFr__c,DescriptionIt__c,TitleEn__c,TitleFr__c,TitleIt__c FROM News__c ';

        if(String.isNotBlank(searchText)){
            String texto ='%'+ searchText +'%';
            switch on currentLang {
                when 'it' {
                    condition.add( ' TitleIt__c LIKE: texto ' ) ;
                }
                when 'fr' {
                    condition.add( ' TitleFr__c LIKE: texto ' ) ;     
                }
                when 'en_US' {
                    condition.add( ' TitleEn__c LIKE: texto ' ) ;    
                }
            }
            
        } 

        if(String.isNotBlank(description)){
            String descr ='%'+ description +'%';
            switch on currentLang {
                when 'it' {
                    condition.add( ' DescriptionIt__c LIKE: descr ' ) ;
                }
                when 'fr' {
                    condition.add( ' DescriptionFr__c LIKE: descr ' ) ;     
                }
                when 'en_US' {
                    condition.add( ' DescriptionEn__c LIKE: descr ' ) ;    
                }
            }
            
        } 

        if(String.isNotBlank(name)){
            String  text='%'+ name +'%';
            switch on currentLang {
                when 'it' {
                    condition.add( ' TitleIt__c LIKE: text') ;
                }  
                when 'fr' {
                    condition.add( ' TitleFr__c LIKE: text') ;    
                }
                when 'en_US' {
                    condition.add( ' TitleEn__c LIKE: text') ;   
                }
            }
            
        } 

        if( isactive!=null){
            condition.add( ' IsActive__c = '+ isactive) ;
        } 

        if(condition.size()>0){
             query+=  ' WHERE ' + String.join(condition, ' AND ') + ' order by LastModifiedDate DESC';
             system.debug('--->  query '+ query );
            return Database.query(query);
        } 

        query+=  ' order by LastModifiedDate DESC';
        return  Database.query(query);
    }

    
 
}