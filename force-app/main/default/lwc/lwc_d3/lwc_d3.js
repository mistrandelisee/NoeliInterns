import { LightningElement } from 'lwc';
import D3  from '@salesforce/resourceUrl/d3';
import  {  loadStyle,loadScript } from "lightning/platformResourceLoader";

export default class Lwc_d3 extends LightningElement {
    connectedCallback() {
        this.loadScript();
    }

    loadScript() {
        Promise.all([
          loadStyle(this, D3 + '/mystyle.css'),
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
        var data = [
            { data: 10, color: "red", start: 0 },
            { data: 5, color: "yellow", start: 10 },
            { data: 12, color: "green", start: 15 },
            { data: 15, color: "blue", start: 27 },
          ];
          
          var width = 300;
          var scaleFactor = 20, barHeight = 40;
          
          var graph = d3
            .select(this.template.querySelector('[data-id="bar"]'))
            .append("svg")
            .attr("width", width * data.length)
            .attr("height", barHeight);
          
          var bar = graph
            .selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .attr("transform", function (d, i) {
              return "translate(" + d.start * scaleFactor + ",10)";
            });
          bar
            .append("rect")
            .attr("width", function (d) {
              return d.data * scaleFactor;
            })
            .attr("fill", function (d) {
              return d.color;
            })
            .attr("height", barHeight - 1);
          bar
            .append("text")
            .attr("x", function (d) {
              return d.data * scaleFactor;
            })
            .attr("y", barHeight / 2);
          bar
            .append("text")
            .attr("x", function (d, i) {
              return d.data * (scaleFactor - 1.5);
            })
            .attr("y", 25)
            .attr("stroke", "black")
            .attr("font-size", "10px")
            .attr("font-family", "sans-serif")
            .text(function (d) {
              return d.data;
            });
          //   graph -End
          //   Donut -Start

            var donutWidth=400, donutheight =400;
            var donut = d3
            .select(this.template.querySelector('[data-id="donut"]'))
            .append("svg")
            .attr("width",donutWidth)
            .attr("height", donutheight);
            var radius = Math.min(donutWidth, donutheight) / 2;

            var g = donut
            .append("g")
            .attr("transform", "translate(" + donutWidth / 2 + "," + donutheight / 2 + ")");

            var color = d3.scaleOrdinal([
            "gray",
            "#e3f2fd",
            "brown",
            "orange",
            "yellow",
            "red",
            "purple",
            ]);

            var pie = d3.pie().value(function (d) {
            return d.percent;
            });

            var path = d3
            .arc()
            .outerRadius(radius - 10)
            //   .innerRadius(100); //Donut chart is a pie chart with hole inside :)
            .innerRadius(0);


            var label = d3
            .arc()
            .outerRadius(radius)
            .innerRadius(radius -80);

            var data = [
            { states: "new york", percent: 80.0 },
            { states: "opus", percent: 170.0 },
            { states: "manathan", percent: 100.0 },
            { states: "yaounde", percent: 5.0 },
            { states: "kribi", percent: 10.0 },
            { states: "edea", percent: 90.0 },
            { states: "opusi", percent: 20.0 },
            ];

            var arc = g
            .selectAll(".arc")
            .data(pie(data))
            .enter()
            .append("g")
            .attr("class", "arc");

            arc
            .append("path")
            .attr("d", path)
            .attr("fill", function (d) {
            return color(d.data.states);
            })
            .on("mouseover", onMouseOverDonut)
            .on("mouseout", onMouseOutDonut);

            console.log(arc);

            arc
            .append("text")
            .attr("transform", function (d) {
            return "translate(" + label.centroid(d) + ")";
            })

            .text(function (d) {
            console.log(`d content `, d );
            return d.data.states;
            }).attr("class", "title");

            function onMouseOverDonut(d, i) {
            var arc= d3.select(this);
            arc.attr("class", "highlight");
            arc
            .transition()
            .duration(500);
            // attr("width", 500)
            //   .attr("y", function (d) {
            //     return y(d.population) - 10;
            //   })
            //   .attr("height", function (d) {
            //     return height - y(d.population) + 10;
            //   });
            // g.append("text")
            //   .attr("class", "val")
            //   .attr("x", function () {
            //     return x(d.year);
            //   })
            //   .attr("y", function () {
            //     return y(d.value) - 10;
            //   });
            }
            function onMouseOutDonut(d, i) {
            d3.select(this).classed("highlight", false);//to remove the class highlight
            d3.select(this)
            .transition()
            .duration(200);
            //   .attr("width", x.bandwidth())
            //   .attr("y", function (d) {
            //     return y(d.population);
            //   })
            //   .attr("height", function (d) {
            //     return height - y(d.population);
            //   });
            // d3.selectAll(".val").remove();
            }

                
    }
}