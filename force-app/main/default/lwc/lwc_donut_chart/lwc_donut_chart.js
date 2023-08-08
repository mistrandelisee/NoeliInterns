import { LightningElement, api } from 'lwc';
import D3  from '@salesforce/resourceUrl/d3';
import  {  loadStyle,loadScript } from "lightning/platformResourceLoader";

export default class Lwc_donut_chart extends LightningElement {
    connectedCallback() {
        this.loadScript();
        console.log('width    '+this.width);
    }
    @api labelKey='label';
    @api valueKey='value';
    @api width=400;
    @api items=[
        {
            label:'Clients',
            value: 70,
            key:'client',
            color:'#F24E1E',
            link:'http://'
        },
        {
            label:'Agents',
            value: 50,
            key:'agent',
            color:'#0E3380',
            link:'http://'
        }
        ,
        {
            label:'Gestionnaires',
            value: 5,
            key:'manager',
            color:'#3686F7',
            link:'http://'
        }
    ]
    get _counts(){
        return  this.items?.reduce((acc,item) => {
        return acc+ item.value; ;
        },0) || 0;
    };
    get data(){
        const self=this
        return this.items.map(item =>{
            return {...item,label:item[self.labelKey], percent: item[self.valueKey]}
        })
    }
    loadScript() {
        Promise.all([
          loadStyle(this, D3 + '/ma_report.css'),
          loadScript(this, D3 + '/d3.v7.min.js')
        ]).then(() => {
                      console.log('load D3 ok');
                      this.initializeD3();
           })    
          .catch((error) => {
              // Handle error
              console.log('Error in load D3');
              console.log(error);
          });
          
    }
    initializeD3(){
        const donutWidth=400, donutheight =400;
          //   Donut -Start
        const tooltip_div = d3.select(this.template.querySelector('[data-id="tooltip"]'))
                                .append("div")
                                .attr("class", "tooltip")         
                                .style("opacity", 0);
        
        const donut = d3.select(this.template.querySelector('[data-id="donut"]'))
                    .append("svg")
                    .attr("width",donutWidth)
                    .attr("height", donutheight);
        
        const radius = Math.min(donutWidth, donutheight) / 2;

        const g = donut
                .append("g")
                .attr("transform", "translate(" + donutWidth / 2 + "," + donutheight / 2 + ")");

        const pie = d3.pie().value(function (d) {
                    return d.percent;
                    });
        const bandwidth= 50;            
        var path = d3.arc()
                    .outerRadius(radius - 10)
                    .innerRadius(radius - bandwidth); //Donut chart is a pie chart with hole inside :)
                    // .innerRadius(0);
        console.log('##################path');
        console.log(path);

        const arc = g.selectAll(".arc")
                    .data(pie(this.data ))
                    .enter()
                    .append("g")
                    .attr("class", "arc");

        arc.append("path")
            .attr("d", path)
            .attr("fill", function (d) {
                        return d.data.color;
                    })
            .transition()
            .duration(500)
            .on("mouseover", onMouseOverDonut)
            .on("mouseout", onMouseOutDonut)
            // .append("title")
            // .text(d => `${d.data.label} (${d.data.percent})`);

        // console.log(arc);

        function onMouseOverDonut(event, d) {

            const arc= d3.select(this);
                    arc.attr("class", "highlight");
                arc.transition()
                    .duration(500);
                    
            let left=event.x;

            tooltip_div.transition()        
                        .duration(200)      
                        .style("opacity", .9);
            tooltip_div.html(buildTooltipHtml(d.data))
                        .style("left", (left) + "px")     
                        .style("top", event.layerY+ "px");
        }
        function onMouseOutDonut(d, i) {
            d3.select(this).classed("highlight", false);//to remove the class highlight
            d3.select(this)
                .transition()
                .duration(200);
            tooltip_div.transition()
                .duration(500)
                .style("opacity", 0);
        }
        function buildTooltipHtml(data){
            return `${data.label} : ${data.percent} `
        }

                
    }
}