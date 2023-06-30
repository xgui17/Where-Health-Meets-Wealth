function project(){
    let filePath1="cleaned_health.csv";
    healthData(filePath1);
    let filePath2="cleaned_network.csv";
    networkData(filePath2);

    
}

let healthData=function(filePath){
    //preprocess data
    d3.csv(filePath).then(function(data){
        data.forEach(d => {
            d.country = d['Country (or dependency)']
            d.developed = +d.Economy_status_Developed,
            d.GDP = +d.GDP_per_capita,
            d.HIV = +d.Incidents_HIV,
            d.infantDeath = +d.Infant_deaths,
            d.lifeExpectancy = +d.Life_expectancy,
            d.population = +d.Population_mln,
            d.Schooling = +d.Schooling,
            d.vaxRate = +d.avg_vax_rate

            const to_delete = ['Country (or dependency)', 'Economy_status_Developed',
                            'GDP_per_capita', 'Incidents_HIV', 'Infant_deaths',
                            'Life_expectancy', 'Population_mln', 'avg_vax_rate'];
            for (let i in to_delete){
                delete d[to_delete[i]];
            }
        });
        console.log(data)

        figure1(data);
        figure2(data);
        regionalAverage(data);
    });
}

let networkData=function(filePath){
    //preprocess data
    d3.csv(filePath).then(function(data){
        data.forEach(d => {
            d.dah = +d.dah_21
            d.recipient = d.recipient_region
            d.source = d.source_Region

            const to_delete = ['dah_21', 'recipient_region', 'source_Region'];
            for (let i in to_delete){
                delete d[to_delete[i]];
            }
        })
        for (let i in data){
            const d = data[i];
            if ((d.recipient == d.source) || (d.recipient == 'N/A') || (d.source == 'N/A')) {
                data.splice(i--, 1);
            }
        }
        console.log(data)
        figure3(data);
    });
}

let figure1=function(data){
    
    const svgwidth = 550;
    const svgheight = 550;
    let svg1 = d3.select("#scatter-container").append("svg")
        .attr("width", svgwidth)
        .attr("height", svgheight);
    let padding = 50;
    let internalPaddingL = 600;
    let internalPaddingR = 1;
    let legendPadding = 1;

    // scale
    const colors = ['#00539C','#F96167']
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d=>d.Schooling) - legendPadding, d3.max(data, d=>d.Schooling) + internalPaddingR])
        .range([ padding, svgwidth - padding ]);
    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d=>d.infantDeath) - legendPadding, d3.max(data, d=>d.infantDeath)])
        .range([ svgheight - padding, padding]);
    const colorScale = d3.scaleOrdinal()
        .domain([0, 1])
        .range(colors);
        
    // axis
    const xAxis = d3.axisBottom(xScale).ticks(15)
    svg1.append("g").attr("class", "xAxis")
        .attr("transform", "translate(0," + (svgheight - padding) + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("class", "plot-text");
    svg1.append("g").attr("class", "yAxis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .attr("class", "plot-text");
    
    // points
    const scatterGroup = svg1.selectAll("g")
        .data(data).enter()
        .append("g")
        .attr("class", 'scatter')
        .attr("transform", d => `translate(${xScale(d.Schooling)}, ${yScale(d.infantDeath)})`);
    
    const circles = scatterGroup
        .append('circle')
        .attr('r', 5)
        .style('fill', (d) => colorScale(d.developed));

    svg1.append('text')
        .attr('id', 'xAxisTitle1')
        .attr("class", "plot-text")
        .style('font-size', "15px")
        .attr("x", (svgwidth / 2))
        .attr("y", (svgheight - padding / 6))
        .attr("text-anchor", "middle")  
        .text("Average Years of Education");

    svg1.append('text')
        .attr('id', 'yAxisTitle1')
        .attr("class", "plot-text")
        .style('font-size', "15px")
        .attr("x", padding / 4)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${padding / 4},${(svgheight / 2)}) rotate(270)`) 
        .text("Infant Mortality Rate Per 1000 People");
    

    // legend
    var keys = ["Developing", "Developed"]
    var color1 = d3.scaleOrdinal()
        .domain(keys)
        .range(colors);
    
    svg1.selectAll("dots")
        .data(keys)
        .enter()
        .append("circle")
        .attr('class', 'dots')
        .attr("cx", 430)
        .attr("cy", (d,i) => (100 + i*25))
        .attr("r", 7)
        .style("fill", (d) => color1(d));

    svg1.selectAll("labels")
        .data(keys)
        .enter()
        .append("text")
        .attr('class', 'labels')
        .attr("x", 450)
        .attr("y", (d,i) => (100 + i*25)) 
        .text((d) => d)
        .attr("class", "plot-text")
        .style('font-size', "15px")
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");  
        
    // title
    svg1.append('text')
        .attr('id', 'plotTitle1')
        .attr("class", "plot-text")
        .style('font-size', "20px")
        .attr("x", (svgwidth / 2))
        .attr("y", (padding / 2))
        .attr("text-anchor", "middle")  
        .text("Average Years of Education vs. Infant Mortality");

    // tooltip
    let tooltip = d3.select("#scatter-container")
            .append("div")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "#D3D3D3")
            .style("padding", "5px")
            .attr("class", "plot-text")
        
    circles
        .on("mouseover", function(e,d){
            let country = d.country;
            let id = d.infantDeath;
            let school = d.Schooling;
          
            d3.select(this)
              .style("fill", "#317773");

            tooltip.style("opacity", 1)
                .html("<u>" + country + "</u><br/> Average Schooling: " + school 
                    + " years<br/> Infant Mortality: " + id + " per 1000 people")
                .style("left", (e.pageX + 10) + "px")
                .style("top", (e.pageY + 10) + "px")
        })
        .on("mouseout", function(e,d) {
            d3.select(this).style("fill", colorScale(d.developed))
            tooltip.style("opacity", 0)
        }) 
}



let figure2=function(data){
    const svgwidth = 800;
    const svgheight = 400;
    let svg2 = d3.select("#map-container").append("svg")
        .attr("width", svgwidth)
        .attr("height", svgheight);
    
    // title
    // svg2.append('text')
    // .attr('id', 'plotTitle2')
    // .attr("class", "plot-text")
    // .style('font-size', "20px")
    // .attr("x", (svgwidth / 2))
    // .attr("y", (padding / 2))
    // .attr("text-anchor", "middle")
    // .text("Choropleth of Average Infant Vaccination Rate");

    const allCountry = {};
    d3.json("./world.json").then(function(json){
        for (let i in json.features){
            allCountry[json.features[i].properties.iso_a3_eh]={"vax":0, "mortality":0, "GDP":0};
        }
        for (let i in data){
            const key = data[i]['ISO'];
            if (allCountry[key]){
                allCountry[key]["vax"] = data[i]['vaxRate'];
                allCountry[key]["mortality"] = data[i]['infantDeath'];
                allCountry[key]["GDP"] = data[i]['GDP'];
            }
        }

        console.log("json", json);
        drawMap(json);
    })

    // scale
    const sMin = d3.min(data, d => d.vaxRate)
    const sMax = d3.max(data, d => d.vaxRate)
    const logScale = d3.scaleLog()
                        .domain([sMin, sMax])
                        .range([0, 100])
    const colorScale = d3.scaleSequential()
                        .domain([0, 100])
                        .interpolator( d3.interpolate("#dadaeb", "#4a1486"))
    const legendPadding = 50;

    // legend
    const legendHeight = svgheight * (3/5)
    const legendWidth = 10;
    const legendGroup = svg2.append("g").attr("transform", "translate(40," + (svgheight/5) + ")")
    const legendScale = d3.scaleLinear()
                    .domain([sMin, 100])
                    .range([legendHeight, 0]);
    const legendAxis = d3.axisLeft(legendScale).ticks(6);
    const legend = legendGroup.append("g")
        .attr("class", "legend")
        .call(legendAxis)
        .selectAll("text")
        .attr("class", "plot-text");

    //Append a defs (for definition) element to your SVG
    const defs = svg2.append("defs");

    //Append a linearGradient element to the defs and give it a unique id
    const linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");
    
    linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#4a1486");
    
    linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#dadaeb"); 
    
    linearGradient
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

    legendGroup.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("fill", "url(#linear-gradient)");
    

    // map
    const projection = d3.geoEquirectangular()
        .translate([(svgwidth - legendPadding) / 2, svgheight/2]).precision(0.1).scale(110)
        .fitExtent([[legendPadding, 0.5], [svgwidth - legendPadding, svgheight - 0.5]], {type: "Sphere"})
       
    let geoGenerator = d3.geoPath().projection(projection);

    let countryName = svg2.append("text").attr("class", "plot-text");
    countryName.style("pointer-events", "none");

    function drawMap(geojson) {
        let country = svg2.selectAll("path").data(geojson.features);

        country
            .enter()
            .append("path")
            .attr("class","country-path")
            .attr("d", geoGenerator)
            .attr("stroke", "white")
            .attr("fill", d => colorScale(logScale(allCountry[d.properties.iso_a3_eh]["vax"])))
            .on("mouseover", handleMouseover)
            .on("mouseout", handleMouseout);
        
        countryName.raise();     
    }

    // Interactivity
    function handleMouseover(e, d) {
        
        if (allCountry[d.properties.iso_a3_eh]["vax"]!=0){
            tooltip.style("opacity", 1)
            .html("<u>"+d.properties.name+"</u>" + "<br/>Average Infant Vaccination Rate: " + allCountry[d.properties.iso_a3_eh]["vax"].toFixed(1) 
                    + "%<br/>Infant Mortality Rate: " + allCountry[d.properties.iso_a3_eh]["mortality"].toFixed(1) + " per 1000 people" 
                    + "<br/>GDP Per Capita: $" + allCountry[d.properties.iso_a3_eh]["GDP"])
            .style("left", (e.pageX + 10) + "px")
            .style("top", (e.pageY + 10) + "px")
        } else {
            tooltip.style("opacity", 1)
            .html("<u>"+d.properties.name+"</u>" + "<br/>Data Missing :(")
            .style("left", (e.pageX + 10) + "px")
            .style("top", (e.pageY + 10) + "px");
        }

        d3.select(this).transition().attr("fill", "#81D8D0");
    }

    function handleMouseout(e, d) {
        d3.select(this).transition().attr("stroke", "white").attr("fill", d => colorScale(logScale(allCountry[d.properties.iso_a3_eh]["vax"])));
        
        countryName.text("");
        
        tooltip.style("opacity", 0)
    }

    // tooltip
    let tooltip = d3.select("#map-container")
        .append("div")
        .style("opacity", 0)
        .attr("class", "plot-text")
        .style("position", "absolute")
        .style("background-color", "#D3D3D3")
        .style("padding", "5px")
        .style('font-size', "15px");

    // create zoom effect
    let zoom = d3.zoom()
        .scaleExtent([1, 6])
        .on('zoom', function(event) {
            svg2.selectAll('path.country-path')
                .attr('transform', event.transform);
    }); 

    svg2.call(zoom);

}

let regional = {};

let regionalAverage=function(data){
    regional.average = d3.rollup(data, v => d3.mean(v, d=>d.GDP), d => d.Region);
    console.log(regional.average)
}


let figure3=function(data){

    // data
    const nodes = [];
    const links = [];
    const allRegion = [data.map(d => d.source)][0].concat([data.map(d => d.recipient)][0]);
    const regions = [...new Set(allRegion)];
    console.log(regions)
    const nodeDict = {};
    const donatedTemp = d3.rollup(data, v => d3.sum(v, d => d.dah), d => d.source);
    const receivedTemp = d3.rollup(data, v => d3.sum(v, d => d.dah), d => d.recipient);

    const regionalGDP = new Map([...regional.average.entries()]);
    
    for (let i in regions) {
        const dict = {"id": parseInt(i), "name": regions[i]}
        dict["GDP"] = regionalGDP.get(regions[i])
        
        if (donatedTemp.get(regions[i])){
            dict["donate"] = donatedTemp.get(regions[i]);
        } else {
            dict["donate"] = 0;
        }
        if (receivedTemp.get(regions[i])){
            dict["receive"] = receivedTemp.get(regions[i]);
        } else {
            dict["receive"] = 0;
        }
        nodes.push(dict);
        nodeDict[regions[i]] = parseInt(i);
    }
    console.log(nodes)
    console.log(nodeDict)
    for (let j in data){
        links.push({"source": nodeDict[data[j].source],
                    "target": nodeDict[data[j].recipient],
                    "value": data[j].dah})
    }
    links.pop();
    console.log(links)

    // svg
    const svgwidth = 800;
    const svgheight = 500;
    let svg3 = d3.select("#network-container").append("svg")
        .attr("width", svgwidth)
        .attr("height", svgheight);

    // scale
    const vMin = d3.min(links, d => d.value)
    const vMax = d3.max(links, d => d.value)
    const gMin = d3.min(nodes, d => d.GDP)
    const gMax = d3.max(nodes, d => d.GDP)
    const strokeScale = d3.scaleLinear()
        .domain([vMin, vMax])
        .range([5, 20]);
    const radiusScale = d3.scaleLinear()
        .domain([gMin,gMax])
        .range([10,30]);
    
    //create edges using "line" elements
    let link = svg3.selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke", "#CBD18F")
        .attr("opacity", 0.7)
        .attr("stroke-width", (d) => strokeScale(d.value))
    //create nodes using "circle" elements
    let node = svg3.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr('r', d => radiusScale(d.GDP))
        .style("fill", "#3A6B35")
        .attr("opacity", 0.7)
        .call(
            d3
              .drag()
              .on("start", dragStart)
              .on("drag", drag)
              .on("end", dragEnd)
          );

    // label
    let label = svg3.selectAll(".labels")
        .data(nodes)
        .enter()
        .append('text')
        .text(d => d.name)
        .attr('class', 'plot-text')
        .style('font-size', '15px')

    // force
    let force = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force('center', d3.forceCenter(svgwidth/2, svgheight/2))
		.force('collision', d3.forceCollide().radius(d => radiusScale(d.GDP) + 60))
        .force("charge", d3.forceManyBody())
    
    force.on("tick", function() {
        
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; })
            .on("mouseover", handleMouseoverLink)
            .on("mouseout", handleMouseoutLink);
    
    
        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .on("mouseover", handleMouseoverNode)
            .on("mouseout", handleMouseoutNode);;
        
        label.attr('x', (d) => d.x + 3)
            .attr('y', (d) => d.y + 6)
            
        });


    // drag
    function dragStart(d) {
        force.alphaTarget(0.5).restart();
        d.fx = d.x;
        d.fy = d.y;
        }
        
    function drag(e, d) {
        d.fx = e.x;
        d.fy = e.y;
    }
    
    function dragEnd(d) {
        force.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // tooltip
    let tooltip = d3.select("#network-container")
        .append("div")
        .style("opacity", 0)
        .attr("class", "plot-text")
        .style("position", "absolute")
        .style("background-color", "#D3D3D3")
        .style("padding", "4px")
        .style('font-size', "15px");


    function smartMoney(amount){
        if (amount > 100000){
            return (amount/1000000).toFixed(2) + "B";
        } else if (amount > 100){
            return (amount/1000).toFixed(2) + "M";
        } else {
            return amount + "K";
        }
    }

    function handleMouseoverNode(e, d) {

        d3.select(this).attr("opacity", 1);

        tooltip.style("opacity", 1)
            .html("<u>" + d.name + "</u><br/>" + 
                "Average GDP per capita: $" + (d.GDP).toFixed(2) + "<br/>Donated: $" + smartMoney(d.donate)
                + "<br/>Received: $" + smartMoney(d.receive))
            .style("left", (e.pageX + 10) + "px")
            .style("top", (e.pageY + 10) + "px");
        }

    function handleMouseoutNode(e, d) {

        d3.select(this).attr("opacity", 0.7);

        tooltip.style("opacity", 0);
        }

    function handleMouseoverLink(e, d) {

        d3.select(this).attr("opacity", 1);

        tooltip.style("opacity", 1)
            .html("From <u>" + d.source.name + "</u> to <u>" + d.target.name + "</u>: $" + smartMoney(d.value))
            .style("left", (e.pageX + 10) + "px")
            .style("top", (e.pageY + 10) + "px");
        }

    function handleMouseoutLink(e, d) {

        d3.select(this).attr("opacity", 0.7);

        tooltip.style("opacity", 0);
        }
    
    
}
      

