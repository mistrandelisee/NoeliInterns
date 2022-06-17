import { LightningElement,api } from 'lwc';
import { loadScript } from "lightning/platformResourceLoader";
import workbook from "@salesforce/resourceUrl/WRITEXLSX";
const STD_MODE='STD';
export default class Rh_export_excel extends LightningElement {
    @api items = [];
    @api header = [];
    @api mode=STD_MODE;
    @api hideBtn
    @api
    fileName= 'filexx';
    @api 
    exportNotReady;
    rows;
    librariesLoaded = false;
    objectsData = [
        // Object #1
        {
            name: 'John Smith',
            dateOfBirth: new Date(),
            cost: 1800,
            paid: true
        },
        // Object #2
        {
            name: 'Alice Brown Alice Brown Alice Brown Alice Brown Alice Brown Alice Brown',
            dateOfBirth: new Date(),
            cost: 2600,
            paid: false
        }
    ]
    schemaObj = [
        // Column #1
        {   key:'name',
            column: 'Name',
            type: String,
            wrap: 'true',
            color: '#ccaaaa',
            value: student => student.name
        },
        // Column #2
        {
            key:'dateOfBirth',
            column: 'Date of Birth',
            type: Date,
            format: 'mm/dd/yyyy',
            value: student => student.dateOfBirth
        },
        // Column #3
        {
            key:'cost',
            column: 'Cost',
            type: Number,
            format: '#,##0.00',
            value: student => student.cost
        },
        // Column #4
        {
            key:'paid',
            column: 'Paid',
            type: Boolean,
            value: student => student.paid
        }
    ]
    callBackRow(obj,key){
        let t=key.split('.');//multilevel object
        while(t.length>0 && obj){
            
            let k=t.shift();
            obj=obj[k];
        }
        return obj;
    }
    columns;
    objectsToRows(){
        this.columns=[];
        const columns = [
            {},
            {},
            { width: 20 }, // in characters
            {}
          ]
        let rows=[]
        let header=this.schemaObj;
        let data=this.objectsData;
        let headerKeys=[];
        let headerRow=[];
        header.forEach(e => {
            headerKeys.push(e.key),
            this.columns.push({ width: 20 });
            headerRow.push({value: e.column , fontWeight: 'bold'})
        });
        rows.push(headerRow);
        data.forEach(item => {
          let row=[];
          headerKeys.forEach(hk => {
            let t=hk.split('.');//multilevel object
            let value=item;
            while(t.length>0 && value){
                
                let k=t.shift();
                value=value[k];
            }
            
            
            // row.push(value)
            row.push({value,wrap:true})
          });
          rows.push(row);
  
        });
    console.log(rows);
        return rows;
    }
    @api
    buildRows(header,data){
        let columns=[];
        let rows=[]
        let headerKeys=[];
        let headerRow=[];
        header.forEach(e => {
            headerKeys.push(e.key),
            columns.push({ width: 20 });
            headerRow.push({value: e.column , fontWeight: 'bold'})
        });
        rows.push(headerRow);
        data.forEach(item => {
          let row=[];
          headerKeys.forEach(hk => {
            let t=hk.split('.');//multilevel object
            let value=item;
            while(t.length>0 && value){
                
                let k=t.shift();
                value=value[k];
            }
            row.push({value,wrap:true})
          });
          rows.push(row);
  
        });
    console.log(rows);
        return {rows,columns};
    }
    @api
     setDatas(rows,columns) {
        this.rows=rows;
        this.columns=columns;
         this.launchExport().then(
             ()=>{
console.log('EXPORTEDD');
             }
         ).catch(
            (e)=>{
console.error(e);
            }
        );
    }
    renderedCallback() {
        console.log("renderedCallback xlsx");
        if (this.librariesLoaded) return;
        this.librariesLoaded = true;
        loadScript(this, workbook + "/write-excel-file.min.js")
            .then(async (data) => {
                console.log("success------>>>", data);
            })
            .catch(error => {
                console.log("failure-------->>>>", error);
            });
    }
    // calling the download function from xlsxMain.js
    async download() {
        let _self = this;
        if (STD_MODE.toLowerCase() == this.mode?.toLowerCase()) {
            this.rows=_self.objectsToRows();
            await launchExport();
        }else{
            this.callParent('EXPORT',{});
        }
       
    }
    async launchExport(){
        let _self = this;
        await writeXlsxFile(_self.rows, {
            columns:_self.columns,
            sheet: 'Data',
            fileName: _self.fileName +'.xlsx'
          })
    }
    callParent(actionName,data){
        var actionEvt =new CustomEvent('action',
         {detail: { action : actionName,data }}
      );
      console.log("Watch: actionName ->"+actionName); /*eslint-disable-line*/
      
      this.dispatchEvent(actionEvt);
    }
}