public without sharing class resumeController {
    
    @AuraEnabled
    public static Map<String, Object> sommaire(String sobjet, String field, String condition){

        Map<String, Object> response = new Map<String, Object>();
        try{
            if (String.isBlank(sobjet)) {
                throw new sommaireException('SObject no found');
            }
            if (String.isBlank(field)) {
                throw new sommaireException('Field no found');
            }
            String query = 'SELECT '+field+' label, COUNT(Id) sum FROM '+sobjet;
            String queryWhere =String.isBlank(condition)? '' : 'WHERE '+condition;
            String queryGroupBy ='GROUP BY '+field; 
            query= query+' '+queryWhere+' '+queryGroupBy;
            system.debug(query); 
            List<AggregateResult> aggregateResults=  Database.query(query);
            List<ResultSommaire> resultSommaires =  new List<ResultSommaire>();
            for(AggregateResult agg : aggregateResults){
                ResultSommaire resSom = new ResultSommaire();
                resSom.label = (String) agg.get('label');
                resSom.value = (Integer) agg.get('sum');
                resultSommaires.add(resSom);
            }
            response.put('result', resultSommaires);
        }catch(Exception e){
            response.put('error', e.getMessage());
        }
        return response;
    }
    public class ResultSommaire{
        @AuraEnabled public String label;
        @AuraEnabled Public Integer value;
    }
    public class sommaireException extends Exception {
        
    }
}
