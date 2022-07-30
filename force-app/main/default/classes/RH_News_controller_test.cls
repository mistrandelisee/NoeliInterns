@istest
public with sharing class RH_News_controller_test {
    
    @TestSetup
    static void makeData(){
        list<News__c> activeNewslist = new list<News__c>();
        
        for (Integer i = 0; i<5; i++) {
            activeNewslist.add( new News__c(Name ='News '+i, Description__c = 'Description '+i, IsActive__c = true));    
        }

        insert activeNewslist;

        RH_News_Query instance = RH_News_Query.getInstance();

    }

    @istest
    static void testActiveNews() {
        list<News__c> activeNewslist = [Select Name,Id From News__c where IsActive__c = true];
        list<News__c> activetestList = RH_News_controller.getActiveNews();
        system.assertEquals(activeNewslist.size(), activetestList.size());
    }

    @istest
    static void testUploadFileFail() {
        //RH_News_controller.uploadFile('Ym9ibyBldCBtYW5nZSB0b3V0','bonjour','aaa');
        Map<String,Object> testmap =  RH_News_controller.uploadFile('Ym9ibyBldCBtYW5nZSB0b3V0','bonjour','aaa');
    }

    @istest
    static void testUploadFilePass() {
       //RH_News_controller.uploadFile('Ym9ibyBldCBtYW5nZSB0b3V0','bonjour','a017Q00000dcJRLQA2');
       Map<String,Object> testmap =  RH_News_controller.uploadFile('Ym9ibyBldCBtYW5nZSB0b3V0','bonjour','a017Q00000dcJRLQA2');
    }

    @istest
    static void testUpdateFile() {
        Map<String,Object> testmap =  RH_News_controller.updateFile('Ym9ibyBldCBtYW5nZSB0b3V0','bonjour','a017Q00000dcJRLQA2');
    }

    @istest
    static void testgetAllNews() {
        list<News__c> Newslist = [Select Name,Id From News__c];
        list<News__c> getnewsList = RH_News_controller.getAllNews();
        system.assertEquals(Newslist.size(), getnewsList.size()); 
    }

    @istest
    static void testgetNewsDetails(){
        News__c singleNews = new News__c(Name='news');
        insert singleNews;

        News__c testrecord = RH_News_controller.getNewsDetails(singleNews.Id);
        system.assertEquals('news', testrecord.name); 
    }

    @istest
    static void testupdateNewsVisibility(){
        News__c singleNews2 = new News__c(Name='news');
        insert singleNews2;

        RH_News_controller.updateNewsVisibility(singleNews2.Id, false);
        system.assertEquals(true, singleNews2.IsActive__c); 
    }

    @istest
    static void testupdateNewsFail(){
        News__c singleNews3 = new News__c(Name='news');
        insert singleNews3;

        RH_News_controller.updateNews(singleNews3.Id, 'there are news');
    }

    @istest
    static void testupdateNewsPass(){

        News__c parsevar = new News__c(Name='parser test');
        String newsJson = JSON.serialize(parsevar);

        News__c singleNews3 = new News__c(Name='news');
        insert singleNews3;

        RH_News_controller.updateNews(singleNews3.Id, newsJson);
        system.assertEquals('parser test', singleNews3.Name);
    }

    @istest
    static void testgetOrgConfigFail(){
        RH_News_controller.getOrgConfig();
    }

    @istest
    static void testgetOrgConfigPass(){
        RH_News_controller.configuration param = new RH_News_controller.configuration();
        String JsonData =  JSON.serialize(param);
        
        RH_News_controller.setOrgConfig(JsonData);

        RH_News_controller.getOrgConfig();        
    }

    @istest
    static void testsetOrgConfig(){

        RH_News_controller.configuration param = new RH_News_controller.configuration();
        String JsonData =  JSON.serialize(param);
        
        RH_News_controller.setOrgConfig(JsonData);
    }

    @istest
    static void testnewsCreationFail(){
        RH_News_controller.newsCreation('Anoying string');
    }

    @istest 
    static void testnewsCreationPass(){
        News__c news = new News__c(Name = 'new news');
        String newsJson = JSON.serialize(news);

        RH_News_controller.newsCreation(newsJson);
    }
}