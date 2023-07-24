Map<String, Object> inputMap= new Map<String, Object>{
    'PROVIDER'=>''
};



String jsonStr = JSON.serialize(inputMap);
RH_Export_Controller.initExport( jsonStr);





List<RH_Export_Controller.columnsWrapper> columns = new List<RH_Export_Controller.columnsWrapper>();
columns.add( new RH_Export_Controller.columnsWrapper(System.Label.rh_FirstName, 'FirstName', 'String', true));
columns.add( new RH_Export_Controller.columnsWrapper(System.Label.rh_LastName, 'LastName', 'String', true));
columns.add( new RH_Export_Controller.columnsWrapper(System.Label.rh_Phone, 'Phone', 'Phone', true));
columns.add( new RH_Export_Controller.columnsWrapper(System.Label.rh_Email, 'Email', 'email'));
columns.add( (new RH_Export_Controller.columnsWrapper('Certifications', 'Certification', 'String', true)).Logic('CUSTOM'));
columns.add( (new RH_Export_Controller.columnsWrapper('Skills', 'Skill', 'String')).Logic('CUSTOM'));
columns.add( new RH_Export_Controller.columnsWrapper(System.Label.rh_StartDate, 'RH_Started_Date__c', 'date'));
List<String> records_ids = new List<String>{'0037Q00000Y6PyzQAF','0037Q00000Y5EsuQAF','0037Q00000Y5F58QAF','0037Q00000STWRLQA5','0037Q00000Rm0w4QAB','0037Q00000MbN63QAF','0037Q00000Id7ouQAB','0037Q00000IbuAVQAZ','0037Q00000Ib9MXQAZ','0037Q00000HwBAAQA3','0037Q00000FJDUAQA5','0037Q00000CJ9nzQAD','0037Q00000CIY0uQAH','0037Q00000BKAQoQAP','0037Q00000BJhyLQAT','0037Q00000BJ76uQAD','0037Q00000BIx45QAD','0037Q000009yDQMQA2','0037Q000009wGacQAE','0037Q000009wGRnQAM','0037Q000009w08DQAQ','0037Q000009vzeKQAQ','0037Q000009vA4oQAE','0037Q000009v9l3QAA','0037Q000009v9kyQAA','0037Q000009v8pOQAQ','0037Q000009v7bqQAA','0037Q0000091k42QAA','0037Q000007qapzQAA','0037Q000007qYKQQA2','0037Q000007qYKBQA2','0037Q000007qYJdQAM','0037Q000007qVNJQA2','0037Q000007qSmXQAU'};
/**

'0037Q00000Y6PyzQAF','0037Q00000Y5EsuQAF','0037Q00000Y5F58QAF','0037Q00000STWRLQA5','0037Q00000Rm0w4QAB','0037Q00000MbN63QAF','0037Q00000Id7ouQAB','0037Q00000IbuAVQAZ','0037Q00000Ib9MXQAZ','0037Q00000HwBAAQA3','0037Q00000FJDUAQA5','0037Q00000CJ9nzQAD','0037Q00000CIY0uQAH','0037Q00000BKAQoQAP','0037Q00000BJhyLQAT','0037Q00000BJ76uQAD','0037Q00000BIx45QAD','0037Q000009yDQMQA2','0037Q000009wGacQAE','0037Q000009wGRnQAM','0037Q000009w08DQAQ','0037Q000009vzeKQAQ','0037Q000009vA4oQAE','0037Q000009v9l3QAA','0037Q000009v9kyQAA','0037Q000009v8pOQAQ','0037Q000009v7bqQAA','0037Q0000091k42QAA','0037Q000007qapzQAA','0037Q000007qYKQQA2','0037Q000007qYKBQA2','0037Q000007qYJdQAM','0037Q000007qVNJQA2','0037Q000007qSmXQAU'
 */
Map<String, Object> inputMap= new Map<String, Object>{
    'PROVIDER'=>'',
    'RECORDS_ID'=>records_ids,
    'COLUMNS'=>columns,
    'SOBJECT'=>'Contact'
};

String jsonStr = JSON.serialize(inputMap);

 Map<String, Object> result=RH_Export_Controller.exportData( jsonStr);
List<Object> cols = (List<Object>) result.get('datas');
for(Object obj : cols){
    System.debug('data ????? '+obj);
}
        

System.debug(RH_Skill_Config__mdt.getAll());


sobject con=[SELECT ID,RH_Started_Date__c FROM CONTACT WHERE RH_Started_Date__c!=null LIMIT 1];
Date dt =(Date) con.get('RH_Started_Date__c');
Date td= system.today();
if(dt==null) return 0;
Decimal years=dt.monthsBetween(td) / 12;
         
System.debug(Math.mod(5, 8));


