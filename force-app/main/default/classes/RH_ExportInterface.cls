public Interface RH_ExportInterface {
    Object getColumns(Object args); 
    
    
    /** @@@input
     * Map<String, Object> args
     * args.columns :: list of selected columnns to exports
     * args.ids :: list of if records id to query for to exports
     * 
     * @@output
     * list of formatted data
    */
    // Object buildExportData(Object args);
    Object getExportfield(String field);
    Object getExportValue(sObject record ,String field );
}