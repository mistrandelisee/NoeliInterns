public class RH_SeriesCharts_controller {
    Integer currentYear= System.today().year();
    boolean approved=true;
    boolean reject=true;
    
    public PageReference submit() {
        System.debug('approuve :' + approved);
        return null;
    }
    
    public boolean getApproved() {
        return approved;
    }
    public void setApproved(boolean app) {
        approved = app;
    }
    
    public boolean getReject() {
        return reject;
    }
    public void setReject(boolean app) {
        reject = app;
    }
    public Integer getCurrentYear() {
        return currentYear;
    }
    public void setCurrentYear(Integer year) {
        currentYear = year;
    }
    
    public List<Opportunity> getOpportunitiesQuery(Integer year) {
       return [SELECT name, amount, createdDate,closedate,ExpectedRevenue,DeliveryInstallationStatus__c  FROM Opportunity WHERE CALENDAR_YEAR(CreatedDate) =: year AND (DeliveryInstallationStatus__c  = 'In progress' OR  DeliveryInstallationStatus__c  = 'Yet to begin')];
    }
    
    public List<DataChart> getOpportunities() {
       List<Opportunity> oppList= getOpportunitiesQuery(this.currentYear);
       List<Integer> numberRejectedByMonth = new List<Integer> {0,0,0,0,0,0,0,0,0,0,0,0};
       List<Integer> numberApprouvedByMonth  = new List<Integer> {0,0,0,0,0,0,0,0,0,0,0,0}; 
       List<DataChart> datas = new List<DataChart>();
       for(Opportunity opp: oppList){
           Integer month= opp.CreatedDate.month();
           if(opp.DeliveryInstallationStatus__c  == 'In progress'){
          	   numberRejectedByMonth[month-1]=  numberRejectedByMonth[month-1] + 1;
           }else if(opp.DeliveryInstallationStatus__c == 'Yet to begin'){
          	   numberApprouvedByMonth[month-1]=  numberApprouvedByMonth[month-1] + 1;
           } 
       }
           
       for(Integer i=0; i<numberRejectedByMonth.size(); i++){
          datas.add(new DataChart(i+1, numberApprouvedByMonth[i], numberRejectedByMonth[i],numberApprouvedByMonth[i]+ numberRejectedByMonth[i]));
       }     
       return datas;
    }
    
    //Wrapper class
    public class DataChart {
        public String month { get; set; }
        public Integer data { get; set; }
        public Integer data2 { get; set; }
        public Integer allData { get; set; }
        
        public DataChart(integer month, Integer data, Integer data2, Integer allData){
            this.data= data;
            this.data2= data2;
            this.allData= allData;
            switch on month {
               when 1 {
                  this.month= 'Jan';
               }
               when 2 {
                  this.month= 'Feb';
               }
               when 3 {
                  this.month= 'Mar';
               }
               when 4 {
                  this.month= 'Apr';
               }
               when 5 {
                  this.month= 'May';
               }
               when 6 {
                  this.month= 'Jun';
               }
               when 7 {
                  this.month= 'Jul';
               }
              when 8 {
                  this.month= 'Aug';
               }
              when 9 {
                  this.month= 'Sep';
               }
              when 10 {
                  this.month= 'Oct';
               }
              when 11 {
                  this.month= 'Nov';
               }
              when 12 {
                  this.month= 'Dec';
               }  
            }   
        }
    }
    
}