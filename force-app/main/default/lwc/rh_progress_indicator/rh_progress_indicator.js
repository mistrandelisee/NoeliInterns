import { api, LightningElement } from 'lwc';

export default class Rh_progress_indicator extends LightningElement { 
    @api currentStep=1;
    @api steps=[];
    @api lineStyle='width:12%';
    connectedCallback(){
        this.updateCss(this.currentStep)
    }
    @api updateCss(currentStep){
        currentStep=+currentStep;//accept also string '1'===1
        if (this.steps) {
            this.steps=this.steps.map((step, index) => {
                //default step
                let stepx ={
                    ...step,
                    class:'circle cicrle-top-padding activeStep',
                    labelClass:'stepLabel',
                    passed:false,
                    lineClass:'line'
                   
                }
                if (step.key <=currentStep) {
                    stepx.class='circle cicrle-top-padding activeStep activePassed';
                    stepx.passed=true;
                    stepx.lineClass='line activeBackground'; 
                    if (step.key==currentStep) {
                        stepx.class='circle cicrle-top-padding activeStep activeBackground';
                        stepx.lineClass='line'; 
                        stepx.labelClass='stepLabel activeLabel';
                    }
                }
                return stepx;
            });
            console.log(this.steps);
        }
    }
}