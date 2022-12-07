public without sharing class RH_Summarizer implements RH_SummarizeInterface {
    private static final String GROUPBY_KEY = 'GROUPBY';
    private static final String FIELDS_KEY = 'FIELDS';
    private static final String OBJECT_KEY = 'SOBJECT';
    private static final String CONDITIONS_KEY = 'CONDS';
    private static final String CLASS_KEY = 'PROVIDER';
    public static Map<String,Object> mapInputs;
    
    @AuraEnabled
    public static Map<String, Object> getSummaries(String jsonStr) {
        Map<String, Object> inputs = (Map<String, Object>) JSON.deserializeUntyped(jsonStr);
        Map<String, Object> result= new Map<String, Object>();
        result.put('error', false);
        try {
            String className = String.valueOf(inputs.get(CLASS_KEY));
            result.put('records', perform(className, inputs));
        } catch(Exception e) {
            result.put('error', true);
            System.debug(e.getMessage()+''+ e.getStackTraceString());
            result.put('message', e.getMessage());
        }
        return result;
    }
    public static List<AggregateResult> perform(String className,Map<String,Object> additionalInputs){
        mapInputs=new Map<String, Object> (additionalInputs);
        className=String.isBlank(className)? 'RH_Summarizer' : className;
        mapInputs.put(CLASS_KEY,className);
        RH_SummarizeInterface SummarizeInterface = (RH_SummarizeInterface) Type.forName(className).newInstance();
        List<AggregateResult> aggs=  SummarizeInterface.getSummary(mapInputs);
        return aggs;
    }
    public List<AggregateResult> getSummary(Map<String, Object> args) {
        System.debug('get sum '+args);
        String groupByStr = String.valueOf(args.get(GROUPBY_KEY));
        String fieldsStr = String.valueOf(args.get(FIELDS_KEY));
        String conditionStr= String.valueOf(args.get(CONDITIONS_KEY));
        String sobj = String.valueOf(args.get(OBJECT_KEY));
        return defauftSummirise(groupByStr,fieldsStr,conditionStr,sobj);
    } 
    public static List<AggregateResult> defauftSummirise(String groupByStr, String fieldsStr,String conditionStr, String sobj){
        if (String.isBlank(groupByStr)) {
            throw new summarizeException('No group by field');
        }
        if (String.isBlank(sobj)) {
            throw new summarizeException('Missing Sobject');
        }
        fieldsStr=String.isBlank(fieldsStr)? groupByStr : fieldsStr;
        /**
         * Rh_Status__c
         * RH_Request__c
         */
        // String query = 'SELECT Rh_Status__c status, COUNT(ID) FROM RH_Request__c  ';
        String query = 'SELECT '+fieldsStr+', COUNT(ID) sum FROM '+sobj+' ';
        String queryWHERE =String.isBlank(conditionStr)? '' : 'WHERE '+conditionStr;
        // String queryGROUPBY ='GROUP BY Rh_Status__c';
        String queryGROUPBY ='GROUP BY '+groupByStr;

        System.debug('############# query >' + query);
        System.debug('############# queryWHERE >' + queryWHERE);
        System.debug('############# queryGROUPBY >' + queryGROUPBY);

        query= query+' '+queryWHERE+' '+queryGROUPBY;

        list<AggregateResult> aggregateResults=  Database.query(query);
        for (AggregateResult agg : aggregateResults) {
            System.debug('agg >> '+agg);
        }

        return aggregateResults;
    }
    public class summarizeException extends Exception {
        
    }
    /**
     Map<String, Object> mapinputs = new Map<String, Object>{
        'GROUPBY'=>'Rh_Status__c',
        'FIELDS'=>'Rh_Status__c state',
        'SOBJECT'=>'RH_Request__c',
        'CONDS'=>''
     };
    String jsonStr= JSON.serialize(mapinputs);
     Map<String, Object> result=RH_Summarizer.getSummaries( jsonStr);
     System.debug('result== '+result);









     */
}