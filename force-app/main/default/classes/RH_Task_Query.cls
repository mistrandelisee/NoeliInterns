public  class RH_Task_Query {
    /** The class instance */
    private static RH_Task_Query instance = null;

     /**
     * @description @return the class instance
     */
    public static RH_Task_Query getInstance() {

        if(instance == null) {

            instance = new RH_Task_Query();
        }
        return instance;
    }

    public List<Task> getTaskByIdProject(String IdProject){
        return [SELECT id, Priority, Description,Status,Who.Name,WhoId/*Who.RH_User__c*/  FROM Task WHERE WhatId =:IdProject];
    }
}