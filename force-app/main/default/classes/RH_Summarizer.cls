public without sharing class RH_Summarizer implements RH_SummarizeInterface {
    public static final String GROUPBY_KEY = 'GROUPBY';
    public static final String FIELDS_KEY = 'FIELDS';
    public static final String OBJECT_KEY = 'SOBJECT';
    public static final String CONDITIONS_KEY = 'CONDS';
    public static final String CLASS_KEY = 'PROVIDER';
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
            String message=e.getMessage()+''+ e.getStackTraceString();
            System.debug(message);
            result.put('message', message);
        }
        return result;
    }
    public static List<summaryWrapper> perform(String className,Map<String,Object> additionalInputs){
        mapInputs=new Map<String, Object> (additionalInputs);
        className=String.isBlank(className)? 'RH_Summarizer' : className;
        mapInputs.put(CLASS_KEY,className);
        RH_SummarizeInterface SummarizeInterface = (RH_SummarizeInterface) Type.forName(className).newInstance();
        List<AggregateResult> aggs=  SummarizeInterface.getSummary(mapInputs);
        List<summaryWrapper> sumaries= SummarizeInterface.formatAggregate(aggs, mapInputs);
        return sumaries;
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
    public List<summaryWrapper> formatAggregate(List<AggregateResult> aggs,Map<String, Object> args){
        String groupByStr = String.valueOf(args.get(GROUPBY_KEY));
        String fieldsStr = String.valueOf(args.get(FIELDS_KEY));
        String conditionStr= String.valueOf(args.get(CONDITIONS_KEY));
        String sobj = String.valueOf(args.get(OBJECT_KEY));
        String alias=groupByStr;// by default
        List<summaryWrapper> sumaries = new List<summaryWrapper>();
        Integer i=0; 
        Integer total=0; 
        for (AggregateResult agg : aggs) {
            summaryWrapper swrap= new summaryWrapper();
            swrap.label=(String) agg.get(alias);
            swrap.value = (Integer) agg.get('sum');
            swrap.Key = (String.isBlank(swrap.label))? sobj+i:swrap.label;

            total= total + ( swrap.value!=Null?  swrap.value : 0); 
            sumaries.add(swrap);
            i=i+1;
        }
        /*summaryWrapper allSum= new summaryWrapper();
        allSum.label='ALL';
        allSum.value = total;
        allSum.Key = 'ALL';
        sumaries.add(allSum);*/

        return sumaries;
    }
    public class summarizeException extends Exception {
        
    }

    public class summaryWrapper  {
        @AuraEnabled public string    label;
        @AuraEnabled public string    key;
        @AuraEnabled public Integer   value;
        @AuraEnabled public string    className;
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