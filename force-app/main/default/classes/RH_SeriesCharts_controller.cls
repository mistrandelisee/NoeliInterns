public class RH_SeriesCharts_controller {
    Integer currentYear= System.today().year();
    Integer currentMonth= System.today().month();
    String stringCurrentMonth=(new DataChart()).getMonth(currentMonth).get('currentMonth');
    List<DataChart> datas = new List<DataChart>();
    List<Integer> numberRejectedByMonth = new List<Integer> {8,4,2,7,7,9,9,3,10,2,6,50};
    List<Integer> numberApprouvedByMonth  = new List<Integer> {5,0,2,5,0,0,0,0,0,0,0,6};
    List<Integer> numberPendingByMonth  = new List<Integer> {1,0,3,1,0,0,7,8,0,6,0,0};
    boolean approved=true;
    boolean reject=true;
    
    boolean renderDetail=false;
    boolean renderChart=true;
    
    public PageReference submit() {
        System.debug('approuve :' + approved);
        return null;
    }
    
    public boolean getRenderChart() {
        return renderChart;
    }
    public void setRenderChart(boolean chart) {
        renderChart = chart;
    }
    
    public boolean getRenderDetail() {
        return renderDetail;
    }
    public void setRenderDetail(boolean detail) {
        renderDetail = detail;
    }
    
    public String getStringCurrentMonth() {
        return stringCurrentMonth;
    }
    public void setStringCurrentMonth(String currentMonth) {
        stringCurrentMonth = currentMonth;
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
    
    public Integer getCurrentMonth() {
        return currentMonth;
    }
    public void setCurrentMonth(Integer month) {
        currentMonth = month;
    }
    
    public void  setCurrentMonth() {
       String go = Apexpages.currentPage().getParameters().get('currentMonth');
        this.getDetail();
        
        System.debug('currentPosition >>>>> ' + go);
        System.debug('currentPosition sdffsdf >>>>> ' + this.currentMonth);
    }

    public List<RH_Request__c> getOpportunitiesQuery(Integer year) {
       return [SELECT name, Rh_Status__c  FROM RH_Request__c WHERE CreatedById=:Userinfo.getUserId() AND CALENDAR_YEAR(CreatedDate) =: year AND (Rh_Status__c = 'Completed' OR Rh_Status__c  = 'In progress' OR  Rh_Status__c  = 'Yet to begin')];
    }
    
    public List<DataChart> getOpportunities() {
       integer sumAllData=0;
       List<RH_Request__c> oppList= getOpportunitiesQuery(this.currentYear);
       for(RH_Request__c opp: oppList){
           Integer month= opp.CreatedDate.month();
           if(opp.Rh_Status__c  == 'In progress'){
          	   this.numberRejectedByMonth[month-1]=  this.numberRejectedByMonth[month-1] + 1;
           }else if(opp.Rh_Status__c == 'Yet to begin'){
          	   this.numberApprouvedByMonth[month-1]=  this.numberApprouvedByMonth[month-1] + 1;
           }else if(opp.Rh_Status__c == 'Completed'){
          	   this.numberPendingByMonth[month-1]=  this.numberPendingByMonth[month-1] + 1;
           } 
       }
       
        for(Integer i=0; i<this.numberRejectedByMonth.size(); i++){
          sumAllData= sumAllData + this.numberApprouvedByMonth[i]+ this.numberRejectedByMonth[i] + this.numberPendingByMonth[i];
       }  
           
       for(Integer i=0; i<this.numberRejectedByMonth.size(); i++){
          this.datas.add(new DataChart(i+1,sumAllData, this.numberApprouvedByMonth[i], this.numberRejectedByMonth[i],this.numberPendingByMonth[i],this.numberApprouvedByMonth[i]+ this.numberRejectedByMonth[i] + this.numberPendingByMonth[i]));
       } 
 		system.debug('@@@@@@@@ datas'+ this.datas);
       return this.datas;
    }
    
     public List<DetailChart> getDetail() {
         List<DetailChart> datas= new List<DetailChart>();
         if(this.datas!= null){
             for(Integer i=0; i<this.datas.size(); i++){
                 if(this.currentMonth-1==i){
                     Integer allDataDetail= this.datas[i].dataAccepted+ this.datas[i].dataRejected+this.datas[i].dataPending;
                     datas.add(new DetailChart(allDataDetail,this.datas[i].dataAccepted));
                     datas.add(new DetailChart(allDataDetail,this.datas[i].dataRejected));
                     datas.add(new DetailChart(allDataDetail,this.datas[i].dataPending));
                 }	
       		} 
         } else {
             
         }
        System.debug('data: '+ datas) ;
       return datas;
    }
    
    public class DetailChart {
      public String percent { get; set; } 
      public Integer allRecord { get; set; }
        
      public DetailChart(Integer sumDataDetail, Integer data){
         this.allRecord= data;   
          if(data==0){
              this.percent=''; 
          }else{
              this.percent=  data+' ('+ (data*100/sumDataDetail) +'%)';
          }
      }
        
    }
    
    //Wrapper class
    public class DataChart {
        public String month { get; set; }
        public String monthAbbr { get; set; }
        public Integer monthInteger { get; set; }
        public Integer dataAccepted { get; set; }
        public Integer dataRejected { get; set; }
        public Integer dataPending { get; set; }
        public Integer allData { get; set; }
        public String percent { get; set; }
        
        public DataChart(){
            
        }

        public DataChart(integer month,Integer sumAllData, Integer data, Integer data2, Integer data3, Integer allData){
            this.dataAccepted= data;
            this.dataRejected= data2;
            this.dataPending= data3;
            this.allData= allData;
            this.monthAbbr= this.getMonth(month).get('monthAbbreviation');
            this.month= this.getMonth(month).get('currentMonth');
            this.monthInteger= month;
            
             if(allData==0){
                this.percent=''; 
             }else{
                 this.percent= allData+' ('+ (allData*100/sumAllData) +'%)';
             }
        } 
        
        public Map<String,String> getMonth(Integer month){
            Map<String,String> monthValue= new Map<String,String>{};
            switch on month {
                   when 1 {
                       monthValue.put('currentMonth','January');
                       monthValue.put('monthAbbreviation','Jan');
                   }
                   when 2 {
                       monthValue.put('currentMonth','February');
                       monthValue.put('monthAbbreviation','Feb');
                   }
                   when 3 {
                       monthValue.put('currentMonth','March');
                       monthValue.put('monthAbbreviation','Mar');
                   }
                   when 4 {
                       monthValue.put('currentMonth','April');
                       monthValue.put('monthAbbreviation','Apr');
                   }
                   when 5 {
                       monthValue.put('currentMonth','May');
                       monthValue.put('monthAbbreviation','May');
                   }
                   when 6 {
                       monthValue.put('currentMonth','June');
                       monthValue.put('monthAbbreviation','Jun');
                   }
                   when 7 {
                       monthValue.put('currentMonth','July');
                       monthValue.put('monthAbbreviation','Jul');
                   }
                  when 8 {
                      monthValue.put('currentMonth','August');
                      monthValue.put('monthAbbreviation','Aug');
                   }
                  when 9 {
                      monthValue.put('currentMonth','September');
                      monthValue.put('monthAbbreviation','Sep');
                   }
                  when 10 {
                      monthValue.put('currentMonth','October');
                      monthValue.put('monthAbbreviation','Oct');
                   }
                  when 11 {
                      monthValue.put('currentMonth','November');
                      monthValue.put('monthAbbreviation','Nov');
                   }
                  when 12 {
                      monthValue.put('currentMonth','December');
                      monthValue.put('monthAbbreviation','Dec');
                   } 
                }
            return monthValue; 
        }
    }
    
   
}