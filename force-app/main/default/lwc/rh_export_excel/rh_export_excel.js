import { LightningElement,api } from 'lwc';
import { loadScript } from "lightning/platformResourceLoader";
import workbook from "@salesforce/resourceUrl/WRITEXLSX";
export default class Rh_export_excel extends LightningElement {
    @api items = [];
    @api header = [];
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
    buildSchemaObj(){
        let schemaObj = [];
        let _self = this;
        schemaObj=this.schemaObj.map(
            function(obj){
                let item={...obj};
                item.value=function(elt){
                    return elt[item.key];
                }
            }
        )
        return schemaObj;
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
        // let header=this.header;
        //this.filename='EXPORT_'+new Date().getDate()+'-'+(new Date().getMonth()+1)+'-'+new Date().getUTCFullYear()+'_'+new Date().getTime()+'.xlsx';
        // let data=this.items;
        let data=this.objectsData;
        let headerKeys=[];
        // let headerRow=[];
        let headerRow=[];
        header.forEach(e => {
          headerKeys.push(e.key),
        //   headerRow.push(e.label)
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
        /*_self.objectsToRows();
        // When passing `objects` and `schema`.
        await writeXlsxFile(_self.objectsData, {
            schema: _self.buildSchemaObj(),
            fileName: 'file.xlsx'
        })*/
        await writeXlsxFile(_self.objectsToRows(), {
            columns:_self.columns,
            sheet: 'Data',
            fileName: 'file.xlsx'
          })
    }
}