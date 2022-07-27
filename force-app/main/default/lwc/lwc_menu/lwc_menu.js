import { api, LightningElement } from 'lwc';

export default class Lwc_menu extends LightningElement {
    @api
    items=[
        {
            name:'item1',
            label:'Item 1',
            isParent: true,
            subItems: [
                {
                    name:'item10',
                    label:'Item 10',
                    subItems: []
                },
                {
                    name:'item11',
                    label:'Item 11',
                    subItems: [{
                        name:'item110',
                        label:'Item 110',
                        subItems: [{
                                name:'item1101',
                                label:'Item 1101',
                                subItems: []
                            }]
                        }]
                },
                {
                    name:'item12',
                    label:'Item 12',
                    subItems: [{
                        name:'item120',
                        label:'Item 120',
                        subItems: []
                        }]
                }
    
            ]
        },
        {
            name:'item2',
            label:'Item 2',
            isParent: true,
            subItems: [
                {
                    name:'item20',
                    label:'Item 20',
                    subItems: []
                },
                {
                    name:'item21',
                    label:'Item 21',
                    subItems: [{
                        name:'item210',
                        label:'Item 210',
                        subItems: [{
                                name:'item2101',
                                label:'Item 2101',
                                subItems: []
                            }]
                        }]
                },
                {
                    name:'item12',
                    label:'Item 12',
                    subItems: [{
                        name:'item120',
                        label:'Item 120',
                        subItems: []
                        }]
                }
    
            ]
        },
        {
            name:'item3',
            label:'Item 3',
            isParent: true,
            subItems: []
        }
    ]
    handleSelectItem(event){
        console.log('handle in menu')
        let {item, parentItem,isFinal,root} =event.detail
        console.log("@@@@@@@@@  item ");
        console.log(item?.label)
        console.log("@@@@@@@@@ parent item ");
        console.log(parentItem?.label);

        let selectedId=root.name;
        this.closeOther(selectedId,this.items)
        if (isFinal===true) {
            this.handleFinalLogic(item)
        }
    }
    handleFinalLogic(item){
        console.log('handleFinalLogic SELECTED ITEM JSON');
        console.log(JSON.stringify(item))
    }
    closeOther(selectedId,items=[]){//close other at the same level
        // const selectedId=selectecItem.name;
        let self=this;
        items.forEach(function(item){
            const key = item.name;
            let cmp=self.template.querySelector(`c-lwc_menu_item[data-item-id="${key}"]`);
            if (cmp && (selectedId != key)) {
                return cmp.close();
            }
        });
        
    }
}