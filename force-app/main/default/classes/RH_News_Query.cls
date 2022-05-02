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
        String query = 'SELECT Id, Name, Description__c,IsActive__c,Image__c FROM News__c WHERE IsActive__c = TRUE';
        return Database.query(query);
    }
    
    public List<News__c> getAllNews() {
        return [SELECT Id, Name, Description__c,IsActive__c,Image__c FROM News__c];
    }

    public News__c getNewsById(String recordId){
        List<News__c> newsList= [SELECT Id, Name, Description__c,IsActive__c,Image__c FROM News__c WHERE Id =: recordId ];
        return newsList[0] ;
    }
 
}