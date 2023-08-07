import { LightningElement } from 'lwc';
import D3  from '@salesforce/resourceUrl/d3';
import  {  loadStyle,loadScript } from "lightning/platformResourceLoader";

export default class Lw_d3_histogram extends LightningElement {
    connectedCallback() {
        this.loadScript();
    }

    loadScript() {
        Promise.all([
          loadStyle(this, D3 + '/histoStyle.css'),
          loadScript(this, D3 + '/d3.v4.min.js')
        ]).then(() => {
                      console.log('load D3 ok');
                      this.initializeD3New();
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
    initializeD3New(){
      const data=[ {country:'CMR',
          population:8000 },
          {country:'Ghana',
          population:7500 },
          {country:'Zimbabwe',
          population:5000 },{country:'Whashington',
          population:1200 },{country:'Tokyo',
          population:500 },{country:'Somali',
          population:750 }
      ]
      const margin = {top: 20, right: 20, bottom: 90, left: 120},
      width = 1000 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

      const x = d3.scaleBand()
          .range([0, width])
          .padding(0.8);

      const y = d3.scaleLinear()
          .range([height, 0]);

      const svg = d3.select(this.template.querySelector('[data-id="histogram"]')).append("svg")
                  .attr("id", "svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      const div = d3.select(this.template.querySelector('[data-id="tooltip"]')).append("div")
                  .attr("class", "tooltip")         
                  .style("opacity", 0);
      // Conversion des caractères en nombres
      data.forEach(d => d.population = +d.population);

      // Mise en relation du scale avec les données de notre fichier
      // Pour l'axe X, c'est la liste des pays
      // Pour l'axe Y, c'est le max des populations
      x.domain(data.map(d => d.country));
      y.domain([0, d3.max(data, d => d.population)]);
      
      // Ajout de l'axe X au SVG
      // Déplacement de l'axe horizontal et du futur texte (via la fonction translate) au bas du SVG
      // Selection des noeuds text, positionnement puis rotation
      svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x).tickSize(0))
         
          .selectAll("text")	
              .style("text-anchor", "end")
              .attr("dx", "-.8em")
              .attr("dy", ".15em")
              .attr("transform", "rotate(-65)")
          .call(g => g.append("text")
          .attr("x", width-20)
          .attr("y", -10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text('Unemployment rate (%) →'));
      
      // Ajout de l'axe Y au SVG avec 6 éléments de légende en utilisant la fonction ticks (sinon D3JS en place autant qu'il peut).
      var axisTicks = {qty: 6, outerSize: 0, dateFormat: '%m-%d'};
      var yAxis = d3.axisLeft(y).tickSize(-width, 0, 0).ticks(axisTicks.qty).tickSizeOuter(axisTicks.outerSize);
      svg.append("g")
          .attr("class", "y-axis")
          .call(yAxis)
          .call(g => g.append("text")
          .attr("x", -50)
          .attr("y", -10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text('↑ Frequency'));
      // Ajout des bars en utilisant les données de notre fichier data.tsv
      // La largeur de la barre est déterminée par la fonction x
      // La hauteur par la fonction y en tenant compte de la population
      // La gestion des events de la souris pour le popup
      svg.selectAll(".bar")
          .data(data)
      .enter().append("rect")
          .attr("class", "bar")
          .attr("x", d => x(d.country))
          .attr("width", x.bandwidth())
          .attr("y", d => y(d.population))
          .attr("height", d => height - y(d.population))					
          .on("mouseover", function(d, index) {
            console.log('dddddd //////// ',d);
            let left=d3.event.clientX;
              div.transition()        
                  .duration(200)      
                  .style("opacity", .9);
              div.html("Population : " + d.population)
                  .style("left", (left) + "px")     
                  .style("top", (d3.mouse(this)[1]) + "px");
          })
          .on("mouseout", function(d, index) {
              div.transition()
                  .duration(500)
                  .style("opacity", 0);
          });
      }
}
/***
 * let left=d3.event.clientX-180;
  // console.log('<left  ',left);
  Tooltip
    .style("left", (left) + "px")
    // .style("left", (d3.mouse(this)[0] + 150) + "px")
    .style("top", (d3.mouse(this)[1]) + "px")
 */