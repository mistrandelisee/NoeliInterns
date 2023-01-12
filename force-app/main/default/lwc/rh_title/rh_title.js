import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { labels } from 'c/rh_label';

export default class Rh_title extends LightningElement {
    pageName='';
    pageSubtitle='';
    enableTitle=false;
    
    labels={...labels};

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        debugger
        this.reset();
       if (currentPageReference &&  Object.keys(currentPageReference.state).length === 0){
          let pageApiName = currentPageReference.attributes.name;
          let label= 'Page_' + pageApiName;
          let labelSubTitle= 'Page_Sub_' + pageApiName;

          if (this.labels[labelSubTitle]) {
            this.pageSubtitle= this.labels[labelSubTitle]
          }

          if (this.labels[label]) {
            this.pageName= this.labels[label];
            this.enableTitle = true;
          }
       }
    }

    reset(){
        this.pageName='';
        this.pageSubtitle='';
        this.enableTitle=false;
    }
}