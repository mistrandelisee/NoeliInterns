public without sharing class RH_CustomLookup_Controller {
    @AuraEnabled
    public static  Map<String,Object> SearchRecords(String ObjectName, List<String> ReturnFields, List<String> QueryFields, String SearchText, String SortColumn, String SortOrder, Integer MaxResults, String Filter) {
        Map<String, Object> mapReturn = new Map<String, Object>();
        Map<String, Object> mapInputs = new Map<String, Object>();
        mapReturn.put('error',false);
        try {
            mapInputs.put('ObjectName', ObjectName);            
            mapInputs.put('ReturnFields', ReturnFields);            
            mapInputs.put('QueryFields', QueryFields);
            mapInputs.put('SearchText', SearchText);            
            mapInputs.put('SortColumn', SortColumn);            
            mapInputs.put('SortOrder', SortOrder);            
            mapInputs.put('MaxResults', MaxResults);            
            mapInputs.put('Filter', Filter);  
            mapReturn.put('Inputs', mapInputs);  
            //always put a limit on the results
            if (MaxResults == null || MaxResults == 0) {
                MaxResults = 5;
            }
            
            SearchText = '%' + SearchText + '%';
            
            List <sObject > returnList = new List < sObject > ();
            
            String sQuery =  'SELECT Id, ';
            
            if (ReturnFields != null && ReturnFields.Size() > 0) {
                sQuery += String.join(ReturnFields, ',');
            } else {
                sQuery += 'Name';   
            }
            
            sQuery += ' FROM ' + ObjectName + ' WHERE ';
            
            if (QueryFields == null || QueryFields.isEmpty()) {
                sQuery += ' Name LIKE :SearchText ';
            } else {
                string likeField = '';
                for(string field : QueryFields) {
                    likeField += ' OR ' + field + ' LIKE :SearchText ';    
                }
                sQuery += ' (' + likeField.removeStart(' OR ') + ') ';
            }
            
            if (Filter != null) {
                sQuery += ' AND ' + Filter + '';
            }
            
            if(string.isNotBlank(SortColumn) && string.isNotBlank(SortOrder)) {
                sQuery += ' ORDER BY ' + SortColumn + ' ' + SortOrder;
            }
            
            sQuery += ' LIMIT ' + MaxResults;
            
            System.debug('sQuery :: '+sQuery);
            mapReturn.put('sQuery',sQuery); 
            List <sObject> searchResult = Database.query(sQuery);
        
            
           
            mapReturn.put('Records',searchResult); 
            mapReturn.put('Ok',true); 
        } catch(Exception e) {
            System.debug(e.getMessage());
            mapReturn.put('error',true);
            mapReturn.put('msg',e.getMessage()+' '+e.getStackTraceString());
            mapReturn.put('e',e);
        }  
        return mapReturn;
    }
    @AuraEnabled(cacheable=true)
    public static List<sObject> search(String searchTerm, string myObject, String filter) {
        String myQuery = null;
        if(filter != null && filter != ''){
            myQuery = 'Select Id, Name from '+myObject+' Where Name Like  \'%' + searchTerm + '%\' AND '+filter+' LIMIT  5';
        }
        else {
            if(searchTerm == null || searchTerm == ''){
                myQuery = 'Select Id, Name from '+myObject+' Where LastViewedDate != NULL ORDER BY LastViewedDate DESC LIMIT  5';
            }
            else {
                myQuery = 'Select Id, Name from '+myObject+' Where Name Like  \'%' + searchTerm + '%\' LIMIT  5';
            }
        }
        System.debug('QUERY <<< ' + myQuery);
        List<sObject> lookUpList = database.query(myQuery);
        return lookUpList;
    }
}