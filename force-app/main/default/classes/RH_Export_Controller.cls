public without sharing class RH_Export_Controller implements RH_ExportInterface  {
    public static final String CLASS_KEY = 'PROVIDER';
    public static final String IDS_KEY = 'RECORDS_ID';
    public static final String COLUMNS_KEY = 'COLUMNS';
    public static final String OBJECT_KEY = 'SOBJECT';
    public static Map<String,Object> mapInputs;
   
    @AuraEnabled
    public static Map<String, Object> initExport(String jsonStr) {
       
        Map<String, Object> inputs = (Map<String, Object>) JSON.deserializeUntyped(jsonStr);
        Map<String, Object> result= new Map<String, Object>();
        result.put('error', false);
        try {
            String className = String.valueOf(inputs.get(CLASS_KEY));
            result.put(COLUMNS_KEY, performGetColumns(className, inputs));
        } catch(Exception e) {
            result.put('error', true);
            String message=e.getMessage()+''+ e.getStackTraceString();
            System.debug(message);
            result.put('message', message);
        }
        return result;
    }
    @AuraEnabled
    public static Map<String, Object> exportData(String jsonStr) {
        Map<String, Object> inputs = (Map<String, Object>) JSON.deserializeUntyped(jsonStr);
        Map<String, Object> result= new Map<String, Object>();
        result.put('error', false);
        try {
            String className = String.valueOf(inputs.get(CLASS_KEY));
            result.put('datas', performExport(className, inputs));
        } catch(Exception e) {
            result.put('error', true);
            String message=e.getMessage()+''+ e.getStackTraceString();
            System.debug(message);
            result.put('message', message);
        }
        return result;
    }


    public static Object performGetColumns(String className,Map<String,Object> additionalInputs){
        mapInputs=new Map<String, Object> (additionalInputs);
        className=String.isBlank(className)? 'RH_Export_Controller' : className;
        mapInputs.put(CLASS_KEY,className);
        // RH_ExportInterface ExportInterface = (RH_ExportInterface) Type.forName(className).newInstance();
        // return ExportInterface.getColumns(mapInputs);
        return buildColumns(mapInputs);
    }
    public static Object performExport(String className,Map<String,Object> additionalInputs){
        mapInputs=new Map<String, Object> (additionalInputs);
        className=String.isBlank(className)? 'RH_Export_Controller' : className;
        mapInputs.put(CLASS_KEY,className);
        return doExport();
    }


    public static Object doExport(){
        // Map<String, Object> mapInputs=(Map<String, Object>)obj; 
        String className = String.valueOf(mapInputs.get(CLASS_KEY));
        List<columnsWrapper> cols = (List<columnsWrapper>) JSON.deserialize(JSON.serialize(mapInputs.get(COLUMNS_KEY)), List<columnsWrapper>.class);
        List<String> recordIds = (List<String>) JSON.deserialize(JSON.serialize(mapInputs.get(IDS_KEY)), List<String>.class);
        
        // List<String> Ids = (List<String>)mapInputs.get(IDS_KEY);
        String sobj = String.valueOf(mapInputs.get(OBJECT_KEY));
        if (String.isBlank(sobj)) {
            throw new RH_ControllerException('001','missing sobject type...');
        }
        Set<String> fieldsSetToQuery = new Set<String>();

        RH_ExportInterface ExportInterface = (RH_ExportInterface) Type.forName(className).newInstance();

        for (columnsWrapper col : cols) {
            if (col.logicType=='STD') {
                fieldsSetToQuery.add(col.name);
                
            }else{
                if (col.logicType=='CUSTOM') {
                    // fieldsSetToQuery.add(String.valueOf(ExportInterface.getExportfield(col.name)));
                    fieldsSetToQuery.add(String.valueOf(getExportInterface(col.impl).getExportfield(col.name)));
                }
            }
        }
        if (fieldsSetToQuery.isEmpty()) {
            throw new RH_ControllerException('001','bad action...');
        }
        String query = 'SELECT '+String.join(new List<String>(fieldsSetToQuery), ', ') + ' FROM '+sobj+'  WHERE ID IN:recordIds ';
        List<Contact> conlist = Database.query(query);
        System.debug('fieldsSetToQuery >> ' + fieldsSetToQuery);
        System.debug('conlist >> ' + conlist);

        Map<String, Object> result= new Map<String, Object>();

        for (Contact record : conlist) {
            Map<String, Object> output= new Map<String, Object>();
            for (columnsWrapper col : cols) {
                object value;
                String field=col.name.trim();
                if (col.logicType=='STD') {
                    value=record.get(field);
                }else{
                    if (col.logicType=='CUSTOM') {
                        // value=(ExportInterface.getExportValue(record,field));
                        value=(getExportInterface(col.impl).getExportValue(record,field));
                    }
                }
                output.put(field, value);
            }
            result.put(record.Id, output);
        }
        // System.debug('result >> ' + result);

        return result.values();
    }
    private static RH_ExportInterface getExportInterface(String className) {
        return (RH_ExportInterface) Type.forName(className).newInstance();
    }
    /*
    public Object buildExportData(Object obj){
        Map<String, Object> args=(Map<String, Object>)obj; 

        List<columnsWrapper> cols = (List<columnsWrapper>) JSON.deserialize(JSON.serialize(args.get(COLUMNS_KEY)), List<columnsWrapper>.class);
        List<String> recordIds = (List<String>) JSON.deserialize(JSON.serialize(args.get(IDS_KEY)), List<String>.class);
        
        // List<String> Ids = (List<String>)args.get(IDS_KEY);
        String sobj = String.valueOf(args.get(OBJECT_KEY));
        Set<String> fieldsSetToQuery = new Set<String>();
        for (columnsWrapper col : cols) {
            if (col.logicType=='STD') {
                fieldsSetToQuery.add(col.name);
                
            }else{
                if (col.logicType=='CUSTOM') {
                    fieldsSetToQuery.add(getField(col.name));
                }
            }
        }
        if (fieldsSetToQuery.isEmpty()) {
            throw new RH_ControllerException('001','bad action...');
        }
        String query = 'SELECT '+String.join(new List<String>(fieldsSetToQuery), ', ') + ' FROM Contact  WHERE ID IN:recordIds ';
        List<Contact> conlist = Database.query(query);
        System.debug('fieldsSetToQuery >> ' + fieldsSetToQuery);
        System.debug('conlist >> ' + conlist);

        Map<String, Object> result= new Map<String, Object>();

        for (Contact record : conlist) {
            Map<String, Object> output= new Map<String, Object>();
            for (columnsWrapper col : cols) {
                object value;
                String field=col.name.trim();
                if (col.logicType=='STD') {
                    value=record.get(field);
                }else{
                    if (col.logicType=='CUSTOM') {
                        value=(getValue(record,field));
                    }
                }
                output.put(field, value);
            }
            result.put(record.Id, output);
        }
        // System.debug('result >> ' + result);

        return result.values();
    }*/
    
    public Object getColumns(Object args){
        List<columnsWrapper> columns = new List<columnsWrapper>();
        columns.add( new columnsWrapper(System.Label.rh_Name, 'Name', 'String', true));
        /*columns.add( new columnsWrapper(System.Label.rh_LastName, 'LastName', 'String', true));
        columns.add( new columnsWrapper(System.Label.rh_Phone, 'Phone', 'Phone', true));
        columns.add( new columnsWrapper(System.Label.rh_Email, 'Email', 'email'));
        // columns.add( new columnsWrapper(System.Label.rh_FirstName, 'FirstName', 'String', true));
        // columns.add( new columnsWrapper(System.Label.rh_LastName, 'LastName', 'String', true));
        columns.add( (new columnsWrapper('Certifications', 'Certification', 'String', true)).Logic('CUSTOM'));
        columns.add( (new columnsWrapper('Skills', 'Skill', 'String')).Logic('CUSTOM'));
        columns.add( new columnsWrapper(System.Label.rh_StartDate, 'RH_Started_Date__c', 'date'));*/

        System.debug('columns: ' + columns);
        return columns;
        // return null;
    } 
    public object getExportfield(String col_name){
        /*switch on col_name {
            when 'Certification' {
                return 'RH_Skill_Infos__c';
            }
            when 'Skill' {
                return 'RH_Skill_Infos__c';
            }
            when else {
            
            }
        }
        throw new RH_ControllerException('001','unknow column name');*/
        return null;
    }
    public  Object getExportValue(sObject record ,String field ){
        /*List<String> types = new List<String>{'Certification','Skill'};

        if(types.contains(field)){
            Map<String,RH_Skill_Config__mdt> skillsConfig= RH_Skill_Config__mdt.getAll();
            List<String> values = new List<String>();
            String skill_json=String.valueOf(record.get('RH_Skill_Infos__c'));
            System.debug('skill_json << ' + skill_json);
            if (String.isBlank(skill_json)) {
                skill_json='[]';
            }
            List<String> skill_ids= (List<String>) JSON.deserialize(skill_json, List<String>.class);
            for (String s_id : skill_ids) {
                RH_Skill_Config__mdt config=skillsConfig.get(s_id);
                if (config!=null) {
                    if(config.rh_type__c==field) {
                        values.add(config.RH_Full_Label__c);
                    }
                }
            }
            return String.join(values,',');
        }*/
        return null;
    }
    public static Object buildColumns(Map<String,Object> mapInputs){
        List<columnsWrapper> columns = new List<columnsWrapper>();
        String sobj =(mapInputs.get(OBJECT_KEY) != null) ? String.valueOf(mapInputs.get(OBJECT_KEY)) :'';
        sobj = String.isBlank(sobj)? 'null' :'%'+sobj+'%';
        Contact userContact=RH_Utility.getCurentContact();
        String role=userContact?.RH_Role__c;
        List<String> Visibilities = new List<String>{'ALL', role};
        for (RH_Excel_Field_Config__mdt  column_config : [SELECT  Id,DeveloperName, MasterLabel,ImplementationClass__c,type__c,Selected__c,
                                                            Name__c, Label__c,Object__c, logicType__c, headerStyle__c, rowStyle__c,label FROM RH_Excel_Field_Config__mdt 
                                                            WHERE Object__c LIKE :sobj AND (Visibility__c IN :Visibilities ) ORDER BY Name__c]) {
             columnsWrapper col=new  columnsWrapper(column_config.Label__c, column_config.Name__c,  column_config.type__c,  column_config.Selected__c,column_config.logicType__c);
             col.rowStyle= getStyle(column_config.rowStyle__c) ;
             col.style=getStyle(column_config.headerStyle__c) ;
             col.impl=column_config.ImplementationClass__c;
             columns.add(col);
             System.debug('coll ' + col);
        }
        return columns;
    }
    public static string getStyle(String style_id ) {
        RH_Excel_Style__mdt e_style_config = RH_Excel_Style__mdt.getInstance(style_id);
        if (e_style_config == null) {
            return '';
        }
        return JSON.serialize(buildStyleMap(e_style_config));
    }
    private static Map<String, Object> buildStyleMap(RH_Excel_Style__mdt e_style_config ) {
        Map<String, Object> styleMap = new Map<String, Object>();
        Map<String, Object> response = (Map<String, Object>) JSON.deserializeUntyped(JSON.serialize(e_style_config));
       
        for(string str : response.keyset() ){
            // System.debug('key ==>>'+str);
            object value= response.get(str);
            if((!str.contains('__'))|| value==null){ continue;  }
            String key= str.substringBefore('__c');
            
            styleMap.put(key, value);
        }
        // System.debug('styleMap ' + styleMap);
        return styleMap;
    }
    public class columnsWrapper  {
        @AuraEnabled public String label;
        @AuraEnabled public String name;
        @AuraEnabled public String dataType;
        @AuraEnabled public String logicType='STD';
        @AuraEnabled public boolean selected;
        @AuraEnabled public String style;
        @AuraEnabled public String rowStyle;
        @AuraEnabled public String impl;
        public  columnsWrapper(String label, String name, String dataType, boolean selected,String logicType){
            this.label= label;
            this.name= name;
            this.dataType= dataType;
            this.selected= selected;
            this.logicType=logicType ;
        }
        public  columnsWrapper(String label, String name, String dataType, boolean selected){
            this.label= label;
            this.name= name;
            this.dataType= dataType;
            this.selected= selected;
            this.rowStyle=JSON.serialize(this.defaultStyle()) ;
            this.style=JSON.serialize(this.defaultHeaderStyle()) ;
        }
        public columnsWrapper Logic(String logicType){
            this.logicType= logicType;
            return this;
        }
        public  columnsWrapper(String label, String name, String dataType){
            this.label= label;
            this.name= name;
            this.dataType= dataType;
            this.selected= false;
            this.rowStyle=JSON.serialize(this.defaultStyle()) ;
            this.style=JSON.serialize(this.defaultHeaderStyle()) ;
        }
        public void setRowStyle(Object o){
            this.rowStyle=JSON.serialize(o);
        }
        public void setheaderStyle(Object o){
            this.style=JSON.serialize(o);
        }

        public Object  defaultHeaderStyle(){
            Map<String, Object> styleMap = (Map<String, Object>) RH_Export_Controller.defaultStyle();
            styleMap.remove('height');
            styleMap.remove('format');
            styleMap.remove('borderColor');
            styleMap.remove('borderStyle');
            styleMap.put('align','center');
            styleMap.put('bottomBorderStyle','thick');
            styleMap.put('bottomBorderColor','#aabbcc');
            styleMap.put('width',20);
            // if(this.dataType=='date') styleMap.put('format','mm/dd/yyyy');
            // if(this.dataType=='number') styleMap.put('format','#,##0.00');
            return styleMap;
        }
        public Object  defaultStyle(){
            Map<String, Object> styleMap = (Map<String, Object>) RH_Export_Controller.defaultStyle();
            styleMap.remove('height');
            styleMap.remove('format');
            styleMap.remove('borderStyle');
            styleMap.remove('borderColor');
            styleMap.remove('fontWeight');
            styleMap.put('align','center');
            // if(this.dataType=='date') styleMap.put('format','mm/dd/yyyy');
            // if(this.dataType=='number') styleMap.put('format','#,##0.00');
            return styleMap;
        }
    }
    public static Object  defaultStyle(){
        return new Map<String, Object>{
            'wrap'=>true,
            'fontWeight'=>'bold',
            'format'=>'', // number : '#,##0.00' |  date: 'mm/dd/yyyy'
            // 'height'=>20,
            'fontSize'=>20,
            'align'=>'left',//"left", "center", "right"
            'fontFamily'=>'Calibri',
            'fontStyle'=>'italic',//'italic'
            // 'color'=>'#aabbcc',//'#aabbcc' (in hexademical format)
            'borderColor'=>'#aabbcc',//'#aabbcc'  (in hexademical format)
            // 'backgroundColor'=>'#aabbcc',//'#aabbcc' (in hexademical format)
            'borderStyle'=>'thick'//'thick'
            /****** additional props
             *  leftBorderColor
                leftBorderStyle
                rightBorderColor
                rightBorderStyle
                topBorderColor
                topBorderStyle
                bottomBorderColor
                bottomBorderStyle

             */
        };
    }
}