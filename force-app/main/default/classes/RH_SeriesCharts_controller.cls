public class RH_SeriesCharts_controller {
    private static RH_User_Query userQuery = RH_User_Query.getInstance();
    Integer currentYear= System.today().year();
    Integer currentMonth= System.today().month();
    String stringCurrentMonth=(new DataChart()).getMonth(currentMonth).get('currentMonth');
    List<DataChart> datas = new List<DataChart>();
    List<Integer> numberRejectedByMonth = new List<Integer> {0,0,0,0,0,0,0,0,0,0,0,0};
    List<Integer> numberApprouvedByMonth  = new List<Integer> {0,0,0,0,0,0,0,0,0,0,0,0};
    List<Integer> numberPendingByMonth  = new List<Integer> {0,0,0,0,0,0,0,0,0,0,0,0};
    List<Integer> numberDraftByMonth  = new List<Integer> {0,0,0,0,0,0,0,0,0,0,0,0};
    boolean approved=true;
    boolean reject=true;
    public List<DataChart> Opportunities{get;set;}
    public boolean renderDetail{get;set;}
    public boolean renderChart{get;set;}
    public boolean noData{get;set;}
    

    
    public PageReference submit() {
        System.debug('approuve :' + approved);
        return null;
    }

    public RH_SeriesCharts_controller(){
        this.renderDetail=false;
        this.renderChart=false;
        this.noData=false;
        Opportunities = new List<DataChart> ();
        Opportunities=getRequests();

    }
    
    
    public boolean getRenderChart() {
        return renderChart;
    }
    public void setRenderChart(boolean chart) {
        renderChart = chart;
    }
    /*
    public boolean getRenderDetail() {
        return renderDetail;
    }
    public void setRenderDetail(boolean detail) {
        renderDetail = detail;
    }*/
    
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
    
    public List<DataChart> getRequests() {
       integer sumAllData=0;
       integer allDataMonth=0;
       User u = userQuery.getUserInfoId();
       String conId = u.RH_ContactId__c;
       List<RH_Request__c> reqList= RH_Request_controller.getAllMyRequestByYear(this.currentYear,conId);
       for(RH_Request__c req: reqList){
           Integer month= req.CreatedDate.month();
           if(req.Rh_Status__c  == 'Rejected'){
          	   this.numberRejectedByMonth[month-1]=  this.numberRejectedByMonth[month-1] + 1;
           }else if(req.Rh_Status__c == 'Approved'){
          	   this.numberApprouvedByMonth[month-1]=  this.numberApprouvedByMonth[month-1] + 1;
           }else if(req.Rh_Status__c == 'Submited'){
          	   this.numberPendingByMonth[month-1]=  this.numberPendingByMonth[month-1] + 1;
           } else if(req.Rh_Status__c == 'Draft'){
            this.numberDraftByMonth[month-1]=  this.numberDraftByMonth[month-1] + 1;
           }  
       }
      
        for(Integer i=0; i<this.numberRejectedByMonth.size(); i++){
          sumAllData= sumAllData + this.numberApprouvedByMonth[i]+ this.numberRejectedByMonth[i] + this.numberPendingByMonth[i] + this.numberDraftByMonth[i];
       }  
      
           
       for(Integer i=0; i<this.numberRejectedByMonth.size(); i++){
          allDataMonth=this.numberApprouvedByMonth[i]+ this.numberRejectedByMonth[i] + this.numberPendingByMonth[i]+this.numberDraftByMonth[i];
          this.datas.add(new DataChart(i+1,sumAllData, this.numberApprouvedByMonth[i], this.numberRejectedByMonth[i],this.numberPendingByMonth[i],this.numberDraftByMonth[i],allDataMonth));
          
          if(this.currentMonth-1==i && allDataMonth!=0)
          this.renderDetail= true;
          
       } 
 		system.debug('@@@@@@@@ datas'+ this.datas);
       
        // enable the first chart
        if(sumAllData!=0)
        this.renderChart=true;
        else
         this.noData=true;   
        
       return this.datas;
    }
    
     public List<DetailChart> getDetail() {
         List<DetailChart> datas= new List<DetailChart>();
         if(this.datas!= null){
             for(Integer i=0; i<this.datas.size(); i++){
                 if(this.currentMonth-1==i){
                     Integer allDataDetail= this.datas[i].dataAccepted+ this.datas[i].dataRejected+this.datas[i].dataPending+this.datas[i].dataDraft;
                     datas.add(new DetailChart(allDataDetail,this.datas[i].dataAccepted));
                     datas.add(new DetailChart(allDataDetail,this.datas[i].dataRejected));
                     datas.add(new DetailChart(allDataDetail,this.datas[i].dataPending));
                     datas.add(new DetailChart(allDataDetail,this.datas[i].dataDraft));
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
        public Integer dataDraft { get; set; }
        public Integer allData { get; set; }
        public String percent { get; set; }
        
        public DataChart(){
            
        }

        public DataChart(integer month,Integer sumAllData, Integer data, Integer data2, Integer data3,Integer data4, Integer allData){
            this.dataAccepted= data;
            this.dataRejected= data2;
            this.dataPending= data3;
            this.dataDraft= data4;
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
                       monthValue.put('currentMonth',System.Label.rh_January);
                       monthValue.put('monthAbbreviation','Jan');
                   }
                   when 2 {
                       monthValue.put('currentMonth',System.Label.rh_February);
                       monthValue.put('monthAbbreviation','Feb');
                   }
                   when 3 {
                       monthValue.put('currentMonth',System.Label.rh_March);
                       monthValue.put('monthAbbreviation','Mar');
                   }
                   when 4 {
                       monthValue.put('currentMonth',System.Label.rh_April);
                       monthValue.put('monthAbbreviation','Apr');
                   }
                   when 5 {
                       monthValue.put('currentMonth',System.Label.rh_May);
                       monthValue.put('monthAbbreviation','May');
                   }
                   when 6 {
                       monthValue.put('currentMonth',System.Label.rh_June );
                       monthValue.put('monthAbbreviation','Jun');
                   }
                   when 7 {
                       monthValue.put('currentMonth',System.Label.rh_July );
                       monthValue.put('monthAbbreviation','Jul');
                   }
                  when 8 {
                      monthValue.put('currentMonth',System.Label.rh_August);
                      monthValue.put('monthAbbreviation','Aug');
                   }
                  when 9 {
                      monthValue.put('currentMonth',System.Label.rh_September );
                      monthValue.put('monthAbbreviation','Sep');
                   }
                  when 10 {
                      monthValue.put('currentMonth',System.Label.rh_October );
                      monthValue.put('monthAbbreviation','Oct');
                   }
                  when 11 {
                      monthValue.put('currentMonth',System.Label.rh_November);
                      monthValue.put('monthAbbreviation','Nov');
                   }
                  when 12 {
                      monthValue.put('currentMonth',System.Label.rh_December);
                      monthValue.put('monthAbbreviation','Dec');
                   } 
                }
            return monthValue; 
        }
    }
    
   
}