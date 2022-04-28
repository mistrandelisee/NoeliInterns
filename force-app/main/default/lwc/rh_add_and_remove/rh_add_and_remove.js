import { LightningElement, track, wire ,api} from 'lwc';

export default class Rh_add_and_remove extends LightningElement {

   
    searchValue;
    @api selected = [];
    @api initial = [
    {"Name":"new mistrel11","Email":"kafehisevou-3096@yopmail.com","Id":"0037Q000007HpbqQAC"},
    {"Name":"new mistrel1123","Email":"kafehisevou-3096@yopmail.com","Id":"0037Q000007HpbqQAC"},
    {"Name":"new mistrel23654","Email":"kafehisevou-3096@yopmail.com","Id":"0037Q000007HpbqQAC"},
    {"Name":"new mistrel31526","Email":"kafehisevou-3096@yopmail.com","Id":"0037Q000007HpbqQAC"}, ];
     tempCopy;
     showinit = [];
     showresult = [];
     returnList = [];
     initialList = [];
     selectedList = [];

    connectedCallback() {
        this.showinit = [...this.initial];
        this.showresult = [...this.selected];
        this.initialList = [...this.initial];
        this.selectedList = [...this.selected];
    }

    handleChange(e) {
        this.tempCopy=e.currentTarget.getAttribute("data-id");
        console.log('onItemSelected:::',this.tempCopy);
        
    }

    handleClick(e){
        if(this.tempCopy && !(this.selected.some(e => e.Id === this.tempCopy))){
            let objectSelected = this.initialList.find(obj => obj.Id === this.tempCopy);
            this.selectedList.push(objectSelected);
            console.log('objectSelected:::',objectSelected);
            this.initialList = this.initialList.filter(element => (element.Id).toLowerCase() != this.tempCopy.toLowerCase());
            if(!(this.returnList.some(e => e.Id === objectSelected.Id))){
                this.returnList.push({"Name":objectSelected.Name,"Email":objectSelected.Email,"Id":objectSelected.Id,"isAdd":true});
            }else{

                this.returnList = this.returnList.filter(element => (element.Id).toLowerCase() != (objectSelected.Id).toLowerCase());
            }
            const selectEvent = new CustomEvent('mycustomevent', {
                detail: this.tempCopy
            });
           this.dispatchEvent(selectEvent);
            console.log('onItemSelectedinitial:::',this.initialList);
            console.log('returnList:::',this.returnList);
        }
    }
    handleClick1(e){
        if(this.tempCopy && !(this.initialList.some(e => e.Id === this.tempCopy))){
            let objectSelected = this.selectedList.find(obj => obj.Id === this.tempCopy);
            this.initialList.push(objectSelected);
            console.log('objectSelected:::',objectSelected);
            this.selectedList = this.selectedList.filter(element => (element.Id).toLowerCase() != this.tempCopy.toLowerCase());
            if(!(this.returnList.some(e => e.Id === objectSelected.Id))){
                this.returnList.push({"Name":objectSelected.Name,"Email":objectSelected.Email,"Id":objectSelected.Id,"isAdd":false});
            }else{

                this.returnList = this.returnList.filter(element => (element.Id).toLowerCase() != (objectSelected.Id).toLowerCase());
            }
            
            const selectEvent = new CustomEvent('mycustomevent', {
                detail: this.tempCopy
            });
           this.dispatchEvent(selectEvent);
            console.log('onItemSelectedselected:::',this.selectedList);
            console.log('returnList:::',this.returnList);
        }
    }

    @api getResult(){
        return this.returnList;
    }
    handleSearch(event) {
        this.searchValue = event.target.value;
        this.initial = this.showinit.filter(element => ((element.Name).toLowerCase()).includes(this.searchValue.toLowerCase()));
    }

    handleSearch1(event) {
        this.searchValue = event.target.value;
        this.selected = this.showresult.filter(element => ((element.Name).toLowerCase()).includes(this.searchValue.toLowerCase()));
    }
}