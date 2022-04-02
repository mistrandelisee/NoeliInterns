public without sharing class RH_Utility {
    @AuraEnabled(cacheable=true)
    public static Map<String,Object> getpickListValue() {

         return getPickListOptions(
            new List<String> {
                'RH_Role__c'},
            'Contact');
    }


    public static Map<String, Object> getPickListOptions(List<String> fieldNameList, String objectName) {

        Map<String, Object> returnMap = new Map<String, Object>();
        Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();

        for (String fieldName : fieldNameList) {

            List<PickOption> pickOptions = new List<PickOption>();
            Map<String, Object> fieldValueMap = new Map<String, Object>();
            for (Schema.PicklistEntry sple : fieldMap.get(fieldName).getDescribe().getPicklistValues()) {
                if (sple.isActive()) {
                    PickOption p = new PickOption(sple.getLabel(), sple.getValue());
                    fieldValueMap.put(sple.getLabel(), sple.getValue());
                    pickOptions.add(p);
                }
            }

            returnMap.put(fieldName, pickOptions);
            String extraKey='Map'+fieldName;
            returnMap.put(extraKey, fieldValueMap);
        }

        return returnMap;
    }

    public class PickOption {

        @AuraEnabled
        public String label;
        @AuraEnabled
        public String value;

        public PickOption(String label, String value) {

            this.label = label;
            this.value = value;
        }
    }
}