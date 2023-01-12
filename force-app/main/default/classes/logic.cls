public with sharing class logic {
     @AuraEnabled(cacheable=true)
     public static Map<String,List<Status>> checkPicklist_values(String FieldApiName,String ObjectApiName){
        try {
            AggregateResult[]  groupedResults = Database.query('SELECT '+FieldApiName+' Alias'+',COUNT(Id)Total '+' FROM '+ObjectApiName+' GROUP BY '+FieldApiName);
            Map<String,List<Status>> resultat = new Map<String,List<Status>>();
            List<Status> sumList = new List<Status>();
            for(AggregateResult ar : groupedResults){
                Status objStatus = new Status();
               
                        objStatus.label = (String)ar.get('Alias');
                        objStatus.value = (Integer)ar.get('Total');
                        objStatus.Id = (String)ar.get('Alias')+(Integer)ar.get('Total');
                        sumList.add(objStatus);                
                resultat.put('sommaire',sumList) ;
                
            }
            System.debug('vvvvvvvvvvvv'+resultat);
            return resultat;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
     }
     public class Status {
        @AuraEnabled public String label; 
        @AuraEnabled public integer value; 
        @AuraEnabled public String Id; 
    }
 
	
}