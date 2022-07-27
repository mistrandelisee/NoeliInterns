import { api, LightningElement, track } from 'lwc';

export default class Lwc_menu_item extends LightningElement {
    @track expanded;
    @api padding=1;
    @api parentItem;
    itemStyle={}
    @api
    item;/*={
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
    }*/
    get hasItems(){
        return this.item?.subItems?.length > 0;
    }
    get isParent(){
        return this.item?.isParent;
    }
    get title(){
        return this.item?.label;
    }
    

    get _itemStyle(){
        let style={...this.itemStyle,
            padding:`padding-left:${+this.padding}px;`
        }
        let styleStr='';
        for (const key in style) {
                const element = style[key] || '';
                styleStr+=element;
        }
        // console.log('item: ', this.item?.label);
        // console.log('Style: ', styleStr);
        return styleStr;
    }

    get childPadding(){
        const padding=(+this.padding)+10;
        return padding;
    }
    get _padding(){ return +this.padding || 1}
    @api
    close(){
        this.expanded=false;
        this.itemStyle={...this.itemStyle,
            color:`color:black;`
        }
    }
    
    handleClickItem(event){
        this.expanded=!this.expanded;
        console.log("expanded",this.expanded);
        this.callParent(this.item, this.parentItem);
        this.itemStyle={...this.itemStyle,
            color:`color:red;`
        }
        
    }
    callParent(item, parentItem,doClose=true){
        const selectItemEvent = new CustomEvent('expanditem', {detail: {
            item:item,
            parentItem:parentItem,
            isFinal: !(item?.subItems?.length > 0),
            root: this.isParent ? this.item : null,
            doClose
        }});
        this.dispatchEvent(selectItemEvent);
    }
    handleSelectItem(event){
        let {item, parentItem,doClose} =event.detail
        //console.log("@@@@@@@@@ handling in item "+this.item.label);
        //console.log("@@@@@@@@@  item ");
        // console.log(item)
        //console.log("@@@@@@@@@ parent item ");
        // console.log(parentItem);
        if (doClose) {
            this.closeOther(item,this.item?.subItems)
        }
        this.callParent(item, parentItem,false);//send to parent level
    }
    closeOther(selectecItem,items=[]){//close other at the same level
        const selectedId=selectecItem.name;
        let self=this;
        items.forEach(function(item){
            const key = item.name;
            let cmp=self.template.querySelector(`c-lwc_menu_item[data-sub-item-id="${key}"]`);
            if (cmp && (selectedId != key)) {
                return cmp.close();
            }
        });
        
    }
}