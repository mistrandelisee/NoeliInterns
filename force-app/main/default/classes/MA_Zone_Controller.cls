public without sharing class MA_Zone_Controller {
    private static final String CONST_COUNTRY_FUNCION = 'nl_manage_country';
    private static final String CONST_CITY_FUNCION = 'nl_manage_city';
    static{
        MA_CallFunctionController.TOKEN_REQUIRED =false;
    }
    @AuraEnabled
    public static Map<String, Object> getCountries() {
        
        Map<String, Object> data = new Map<String, Object>{
            'action'=> 'GET-ALL'
        };
        return MA_CallFunctionController.getData(CONST_COUNTRY_FUNCION, data);
    }
    @AuraEnabled
    public static Map<String, Object> getCountry(String countryId) {
        MA_CallFunctionController.TOKEN_REQUIRED =true;
        Map<String, Object> data = new Map<String, Object>{
            'action'=> 'GET-INFO',
            'countryId'=> countryId
        };
        return MA_CallFunctionController.getData(CONST_COUNTRY_FUNCION, data);
    }
    @AuraEnabled
    public static Map<String, Object> getFullCountryInfo(String countryId) {
        
        Map<String, Object> data = new Map<String, Object>{
            'action'=> 'GET-SPEC-INFO',
            'countryId'=> countryId
        };
        return MA_CallFunctionController.getData(CONST_CITY_FUNCION, data);
    }
    @AuraEnabled
    public static Map<String, Object> getCities() {
        
        Map<String, Object> data = new Map<String, Object>{
            'action'=> 'GET-ALL'
        };
        return MA_CallFunctionController.getData(CONST_CITY_FUNCION, data);
    }
}