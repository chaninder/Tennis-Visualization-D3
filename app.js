function final_proj(){
    var filePath="data.csv";
    var cl_filePath = "country_coords.csv";
    viz1(filePath);
    viz2(filePath);
    viz3(filePath, cl_filePath);
    viz4(filePath);
    viz5(filePath);
}

var viz1=function(filePath){


    d3.csv(filePath).then(function(data){

        // Helper function to generate data per selected year
        const getGroups = function(year) {

            // Step 1: Filter data for year
            var filt = data.filter(function (row) { 
                return row['year'] == year; 
            });

            // Step 2: Group by the championships
            var groupedData = d3.rollups(filt, 
                v => d3.mean(v, d => +d.match_minutes), // calculate mean
                d => d.tournament // group by tournament
            );

            // Step 3: Restructure data using mapping
            var finalData = groupedData.map(d => ({
                'tournament': d[0], 
                'mean_match_minutes': +d[1]
            }));

            return finalData;

    
        }

        // Assemble our datasets that we will use for button interactivity
        data_2010 = getGroups('2010')
        data_2012 = getGroups('2012')
        data_2014 = getGroups('2014')
        data_2016 = getGroups('2016')
        data_2018 = getGroups('2018')

        // get groups for plot
        tournaments = data_2010.map(d => {
            return d.tournament
        })

        // get min and max values of y-axis for plot
        datasets = [data_2010, data_2012, data_2014, data_2016, data_2018]
        min_values = []
        max_values = []

        for (i=0;i<datasets.length;i++) {
            vals = datasets[i].map(d=>{return d.mean_match_minutes})
            min_values.push(d3.min(vals))
            max_values.push(d3.max(vals))
        }

        minY = d3.min(min_values)
        maxY = d3.max(max_values)

        // *** START MAKING THE SVG OBJECT ***

        // dims
        const margin = {top: 30, right: 150, bottom: 300, left: 150},
        width = 860 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

        // create structure
        const svg = d3.select("#v1_plot")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

        // X-axis
        const x = d3.scaleBand()
                    .range([0, width])
                    .domain(tournaments)
                    .padding(0.2);
        
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('font-family', 'Comic Sans MS')
            .style('font-size', 17)

        // Y-axis
        buffer = 10
        const y = d3.scaleLinear()
            .domain([0, maxY + buffer])
            .range([height, 0]);
            
        svg.append("g")
            .call(d3.axisLeft(y))
            .selectAll('text')
            .style('font-family', 'Comic Sans MS')
            .style('font-size', 17);
        
            
        // Defining our update function
        update = function update(data) {

            // Get the maximum mean match minutes for the current dataset
            var maxMean = d3.max(data, d => d.mean_match_minutes);

            var updatedSVG = svg.selectAll("rect")
                .data(data)
        
            updatedSVG
                .join("rect")
                .transition()
                .duration(1500)
                .attr("x", d => x(d.tournament))
                .attr("y", d => y(d.mean_match_minutes))
                .attr("width", x.bandwidth())
                .attr("height", d => height - y(d.mean_match_minutes))
                .attr("fill", function(d) {
                    if (d.mean_match_minutes == maxMean) {
                        return 'orange'; 
                    } else {
                        return '#00AFF0'; // Default ATP tennis color
                    }
                })
                .attr('stroke', "#4CAF50") // green for tennis ball
                .attr('stroke-width', 3)
        }
        
        // Set default reload plot
        update(data_2010)

        // Add title
        text_buffer = -200;
        svg.append('text')
            .attr('x', width/2)
            .attr('y', height-text_buffer)
            .attr('text-anchor', 'middle').style('font-size', "30px")
            .text('Average Match Minutes Per Grand Slam Over the Years')
            .style('font-family', 'Comic Sans MS')
            .style('fill', "#240046")

        // Label x-axis title
        text_buffer = -100;
        svg.append('text')
            .attr('x', width/2)
            .attr('y', height-text_buffer)
            .attr('text-anchor', 'middle')
            .style('font-size', "20px")
            .text('Grand Slam Tournament')
            .style('font-family', 'Comic Sans MS')
            .style('fill', "#240046")

        // Label the y-axis
        x_shift_factor = 370
        y_shift_factor = 890
        svg.append('text')
            .attr("transform", "rotate(-90)")
            .attr('x', -x_shift_factor)
            .attr('y', height+margin.bottom-y_shift_factor)
            .style('font-size', "20px")
            .text('Minutes Per Match (average)') 
            .style('font-family', 'Comic Sans MS')
            .style('fill', "#240046")
            
            

    });
        
    
}
var viz2=function(filePath){

    d3.csv(filePath).then(function(data){

        // Helper function to generate data per selected year
        const getDataByYear = function(year) {

            // Step 1: Filter data for year
            var filt = data.filter(function (row) { 
                return row['year'] == year & +row['rank'] <= 10; 
            });

            // Step 2: Group data
            var groupedData = d3.groups(
                filt, 
                d => d.name, 
            );

            newStruct = groupedData.map(d=> {

                player_name = d[0] 
                relevant_arr = d[1] // index into proper array
                service_points = relevant_arr.map(d=> {return +d.service_pts})
                total_points = relevant_arr.map(d=> {return +d.total_pts})

                listOfArrays = [player_name, d3.sum(service_points), d3.sum(total_points)]

                return listOfArrays;

            })
            
            struct = newStruct.map(d=>{return {
                'name': d[0],
                'service_points': d[1],
                'non_service_points': d[2] - d[1]
            }})

            return struct
        }

        // Assemble our datasets that we will use for button interactivity
        data_2010_v2 = getDataByYear('2010')
        data_2012_v2 = getDataByYear('2012')
        data_2014_v2 = getDataByYear('2014')
        data_2016_v2 = getDataByYear('2016')
        data_2018_v2 = getDataByYear('2018')
       

        // *** START MAKING THE SVG OBJECT
        var margin = {top: 100, right: 0, bottom: 300, left: 90},
        width = 1300 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

        var svg = d3.select("#v2_plot")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

        var subgroups = ['service_points', 'non_service_points'] // the sections our bar is split by 
        var groups = data_2010_v2.map(d=>{ // player name
            return d.name
        }) 

        // X-axis
        var x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2])
            
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .selectAll('text')
            .style('font-family', 'Comic Sans MS')
            .style('font-size', 10)
            .attr('x', -60)
            .attr("dy", "3em")
            .attr("transform", "rotate(350)")
            .style("text-anchor", "start")

        maxVal = d3.max(data_2010_v2.map(d=>{return d.service_points + d.non_service_points}))
        buffer = 120
        // Y-axis
        var y = d3.scaleLinear()
            .domain([0, maxVal+buffer])
            .range([ height, 0 ]);
            
        svg.append("g") 
            .call(d3.axisLeft(y))
            .selectAll('text')
            .style('font-family', 'Comic Sans MS')
            .style('font-size', 13);
            
        // color scaling
        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#C7EFCF','#EB7F3C']) // clay orange + tennis green
       
        var stackedData = d3.stack()
            .keys(subgroups)
            (data_2010_v2)


        // *** TOOLTIP ***
        const tooltip = d3.select("#v2_plot")
            .append("div")
            .style("opacity", 10)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style('height', 70)
            .style('width', 140)
            .style('color', 'white')
            .style('font-family', 'Comic Sans MS')

        // Handling interaction functions
        const mouseover = function(event, d) {
            
            const subgroupName = d3.select(this.parentNode)
                                    .datum()
                                    .key;

            const subgroupValue = d.data[subgroupName];
            tooltip
                .html("Statistic: " + subgroupName + "<br>" + "Value: " + subgroupValue)
                .style("opacity", 1)
                .style("background-color", "#00AFF0")
                .style('border-color', 'black')
                .style('border-width', 3)

        }
        const mousemove = function(event, d) {
            const [x, y] = d3.pointer(event, svg.node());
            tooltip
              .style("transform", `translate(${x-1200}px,${y}px)`)
              .style("opacity", 1);
        };
        
        const mouseleave = function(event, d) {
            tooltip
            .style("opacity", 0)
        }

        // Another update function
        update_2 = function update(data) {
    
            // Remove all current svg elements
            svg.selectAll("*").remove();
     
            // Create a new chart
            groups = data.map(d=>{return d.name}) // player name

            // Add X axis
            var x = d3.scaleBand()
                .domain(groups)
                .range([0, width])
                .padding([0.2])
                
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).tickSizeOuter(0))
                .selectAll('text')
                .style('font-family', 'Comic Sans MS')
                .style('font-size', 13)
                .attr('x', -60)
                .attr("dy", "3em")
                .attr("transform", "rotate(350)")
                .style("text-anchor", "start")

            maxVal = d3.max(data.map(d=>{return d.service_points + d.non_service_points}))

            // Add the Y axis
            var y = d3.scaleLinear()
                .domain([0, maxVal+buffer])
                .range([height, 0]);
                
            svg.append("g") 
                .call(d3.axisLeft(y))
                .selectAll('text')
                .style('font-family', 'Comic Sans MS')
                .style('font-size', 12);
            
            stackedData = d3.stack()
                .keys(subgroups)
                (data)

            // Display bars
            svg.append("g")
                .selectAll("g")
                .data(stackedData)
                .enter()
                .append("g")
                .attr("fill", function(d) { 
                    return color(d.key); 
                })
                .selectAll("rect")
                .data(function(d) { 
                    return d; 
                })
                .enter()
                .append("rect")
                .attr("x", function(d) { 
                    return x(d.data.name); 
                })
                .attr("y", function(d) { 
                    return y(d[1]); 
                })
                .attr("height", function(d) { 
                    return y(d[0]) - y(d[1]); 
                })
                .attr("width",x.bandwidth())
                .attr("stroke", "grey")
                .attr("stroke-width", 2.5)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)

            // Add title
            text_buffer = -220;
            svg.append('text')
                .attr('x', width/2)
                .attr('y', height-text_buffer)
                .attr('text-anchor', 'middle').style('font-size', "30px")
                .text('Distribution of Service vs. Non-Service Points Won by the Top 10 Ranked Players')
                .style('font-family', 'Comic Sans MS')
                .style('fill', "#240046")

            // Label x-axis title
            text_buffer = -140;
            svg.append('text')
                .attr('x', width/2)
                .attr('y', height-text_buffer)
                .attr('text-anchor', 'middle')
                .style('font-size', "20px")
                .text('Player Name')
                .style('font-family', 'Comic Sans MS')
                .style('fill', "#240046")

            // Label the y-axis
            x_shift_factor = 270
            y_shift_factor = 775
            svg.append('text')
                .attr("transform", "rotate(-90)")
                .attr('x', -x_shift_factor)
                .attr('y', height+margin.bottom-y_shift_factor)
                .style('font-size', "20px")
                .text('Points Per Year') 
                .style('font-family', 'Comic Sans MS')
                .style('fill', "#240046")
           
            // Add the legend
            svg.append("circle").attr("cx",1000).attr("cy",-80).attr("r", 12).style("fill", "#EB7F3C")
            svg.append("circle").attr("cx",1000).attr("cy",-50).attr("r", 12).style("fill", "#C7EFCF")
            
            svg.append("text").attr("x", 1020).attr("y", -80).text("Non-Service Points")
                .style("font-size", "15px").attr("alignment-baseline","middle").style('font-family', 'Comic Sans MS')
            svg.append("text").attr("x", 1020).attr("y", -50).text("Service Points").style("font-size", "15px")
                .attr("alignment-baseline","middle").style('font-family', 'Comic Sans MS')
        }
        
        // Set default/reload plot to 2010 data
        update_2(data_2010_v2)
        
    });

}

var viz3=function(filePath, cl_filePath){

    var width=1000;
    var height=600;

    var margin = {top: 100, right: 20, bottom: 100, left: 400}

    var svg = d3.select("#v3_plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    const proj = d3.geoEqualEarth()
    const path = d3.geoPath().projection(proj)
 
    // Display the world map
    d3.json("world.json").then(function (world_map) {
        
        // Create the map
        svg
            .selectAll("path")
            .data(world_map.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#240046")
            .style("stroke-width",.5)
            .style("fill", "#C7EFCF");
        
    })
    


    d3.csv(filePath).then(function(data){

 
         // Helper function to generate data per selected year
         const getAcesPerCountry = function(year) {

            // Step 1: Filter data for year
            var filt = data.filter(function (row) { 
                return row['year'] == year; 
            });

            // Step 2: Group data
            var groupedData = d3.groups(
                filt, 
                d => d.country, 
            );

            newStruct = groupedData.map(d=> {

                country_code = d[0] 
                relevant_arr = d[1] // index into proper array
                aces = relevant_arr.map(d=> {return +d.aces})
                

                listOfArrays = [country_code, d3.mean(aces)]

                return listOfArrays;

            })
            

            struct = newStruct.map(d=>{return {
                'country_code': d[0],
                'mean_aces': d[1]
            }})

            return struct
        }

        const countryCodeToName = {
            FRA: 'France',
            CRO: 'Croatia',
            GER: 'Germany',
            USA: 'United States',
            RUS: 'Russia',
            ESP: 'Spain',
            UZB: 'Uzbekistan',
            ECU: 'Ecuador',
            SRB: 'Serbia',
            UKR: 'Ukraine',
            PAR: 'Paraguay',
            AUT: 'Austria',
            FIN: 'Finland',
            ITA: 'Italy',
            GBR: 'United Kingdom',
            NED: 'Netherlands',
            CYP: 'Cyprus',
            ARG: 'Argentina',
            AUS: 'Australia',
            SUI: 'Switzerland',
            ROU: 'Romania',
            TUR: 'Turkey',
            BRA: 'Brazil',
            COL: 'Colombia',
            CZE: 'Czech Republic',
            BEL: 'Belgium',
            KAZ: 'Kazakhstan',
            TPE: 'Chinese Taipei',
            POL: 'Poland',
            URU: 'Uruguay',
            CHI: 'Chile',
            CAN: 'Canada',
            SVK: 'Slovakia',
            RSA: 'South Africa',
            ISR: 'Israel',
            JPN: 'Japan',
            SWE: 'Sweden',
            LTU: 'Lithuania',
            SLO: 'Slovenia',
            IND: 'India',
            LAT: 'Latvia',
            POR: 'Portugal',
            IRL: 'Ireland'
        };

          
    
          
        // assemble our datasets that we will use for button interactivity
        data_2010_v3 = getAcesPerCountry('2010')

        forbidden = ['TPE']
        data_2010_v3 = data_2010_v3.filter(function (row) { 
            return !forbidden.includes(row['country_code'])
        });

        counts = data_2010_v3.map(d=>{return d.mean_aces})
        maxCounts = d3.max(counts)
        minCounts = d3.min(counts)

        var newScale = d3.scaleLinear()
            .domain([minCounts, maxCounts])
            .range([2, 15]);

        var circles = svg.selectAll("circle")
            .data(data_2010_v3)
            .enter()
            .append("circle");

        
        d3.csv(cl_filePath).then(function(country_location_data){
           

            circles
                .attr("cx", function(d) {
                    
                    country_code = d.country_code;
                    country_name = countryCodeToName[country_code]

                    var filt = country_location_data.filter(function (row) { 
                        return row['country'] == country_name; 
                    });

                    latitude = +filt[0].latitude
                    longitude = +filt[0].longitude

                    return proj([longitude, latitude])[0];
                })
                .attr("cy", function(d) {
                    country_code = d.country_code;
                    country_name = countryCodeToName[country_code]

                    var filt = country_location_data.filter(function (row) { 
                        return row['country'] == country_name; 
                    });
                    
                    latitude = +filt[0].latitude
                    longitude = +filt[0].longitude
                
                    return proj([longitude, latitude])[1];
                    
                })
                .attr("r", function(d) {
                    scaledSize = newScale(d.mean_aces) // scale circle size
                    return scaledSize;
                })
                .style("fill", "#240046")
                .style("opacity", 0.4)
                .style("stroke", "orange")
                .style("stroke-width", 0.75);

        });


        // add legend
        sizes = data_2010_v3.map(d=>{return d.mean_aces})
        

        legendSizes = [
            newScale(+d3.min(sizes)),
            newScale((+d3.max(sizes) - +d3.min(sizes)) / 2), 
            newScale(+d3.max(sizes))
        ]
            
        var legend = d3.select("#v3_plot")
                .append("svg")
                .attr("width", 500)
                .attr("height", 400);

        // plot the circle sizes
        legend.selectAll("circle")
            .data(legendSizes)
            .enter()
            .append("circle")
            .attr("cx", 60)
            .attr("cy", function(d, i) {
                return 40*i+100; 
            })
            .attr("r", function(d) {
                return d; 
            })
            .attr("fill", "#240046")
            .style("opacity", 0.5)
            .style("stroke", "orange")
            .style("stroke-width", 0.75);
    
        var legendText = d3.scaleOrdinal()
        .domain(legendSizes)
        .range([
            +d3.min(sizes), 
            +(d3.max(sizes) - +d3.min(sizes))/ 2,
            +d3.max(sizes)

        ]);
        
        // add the text next to the labels
        legend.selectAll("text")
            .data(legendSizes)
            .enter()
            .append("text")
            .attr("x", 90)
            .attr("y", function(d, i) { 
                return 40*i+100; 
            })
            .text(function(d) { 
                return legendText(d) + " aces"; 
            })
            .attr("font-size", "12px")
            .style('font-family', 'Comic Sans MS')
            .attr("alignment-baseline", "middle");

        // add title
        text_buffer = 0;
        svg.append('text')
            .attr('x', width/2)
            .attr('y', height-text_buffer)
            .attr('text-anchor', 'middle').style('font-size', "30px")
            .text('Average Number of Aces Per Game by Players from each Country (2010)')
            .style('font-family', 'Comic Sans MS')


            



    });
    

}

var viz4=function(filePath){

    d3.csv(filePath).then(function(data){
        var filt = data.filter(function (row) { 
            return row['year'] == '2010'; 
        });
        

        // x - service_pts
        // y - bp_saved
        // z - total_pts
        service_points = filt.map(d=>{return +d.first_serve_in })
        break_points = filt.map(d=>{return +d.service_pts})
        total_points = filt.map(d=>{return +d.dbl_faults})
        //console.log(total_points)

        // set the dimensions and margins of the graph
        const margin = {top: 100, right: 100, bottom: 300, left: 300},
            width = 1300 - margin.left - margin.right,
            height = 1000 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        const svg = d3.select("#v4_plot")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

      

        //Read the data
        
        // Add X axis
        buffer = 100
        const x = d3.scaleLinear()
            .domain([0, d3.max(service_points)+buffer])
            .range([ 0, width ]);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .style('font-family', 'Comic Sans MS')
            .style('font-size', 12);

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(break_points)+buffer])
            .range([ height, 0]);

        svg.append("g")
            .call(d3.axisLeft(y))
            .style('font-family', 'Comic Sans MS')
            .style('font-size', 12);

        // Add a scale for bubble size
        bubble_sizes_scale = [1, 20]
        const z = d3.scaleLinear()
            .domain([d3.min(total_points), d3.max(total_points)])
            .range(bubble_sizes_scale);

        // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(filt)
            .join("circle")
            .attr("cx", d => x(d.first_serve_in))
            .attr("cy", d => y(d.service_pts))
            .attr("r", d => z(d.dbl_faults))
            .style("fill", "#00AFF0")
            .style("opacity", "0.5")
            .attr("stroke", "black")



        // Add title
        text_buffer = -200;
        svg.append('text')
            .attr('x', width/2)
            .attr('y', height-text_buffer)
            .attr('text-anchor', 'middle').style('font-size', "30px")
            .text('Number of First Serves In vs. Service Points - Double Fault Analysis (2010)')
            .style('font-family', 'Comic Sans MS')
            .style('fill', "#240046")

        // Label x-axis title
        text_buffer = -90;
        svg.append('text')
            .attr('x', width/2)
            .attr('y', height-text_buffer)
            .attr('text-anchor', 'middle')
            .style('font-size', "20px")
            .text('Number of First Serves In')
            .style('font-family', 'Comic Sans MS')
            .style('fill', "#240046")

        // Label the y-axis
        x_shift_factor = 370
        y_shift_factor = 990
        svg.append('text')
            .attr("transform", "rotate(-90)")
            .attr('x', -x_shift_factor)
            .attr('y', height+margin.bottom-y_shift_factor)
            .style('font-size', "20px")
            .text('Points Won on the Serve') 
            .style('font-family', 'Comic Sans MS')
            .style('fill', "#240046")


        // add legend
        sizes = filt.map(d=>{return +d.dbl_faults})
        
        
        legendSizes = [
            +d3.min(sizes)+1,
            (+d3.max(sizes) - +d3.min(sizes)) / 2, 
            +d3.max(sizes)
        ]
            
        var legend = d3.select("#v4_plot")
                .append("svg")
                .attr("width", 300)
                .attr("height", 500);

        // plot the circle sizes
        legend.selectAll("circle")
            .data(legendSizes)
            .enter()
            .append("circle")
            .attr("cx", 60)
            .attr("cy", function(d, i) {
                return 40*i+100; 
            })
            .attr("r", function(d) {
                return d; 
            })
            .attr("fill", "#00AFF0")
            .style("opacity", 0.5)
            .style("stroke", "red")
            .style("stroke-width", 0.75);
    
        var legendText = d3.scaleOrdinal()
            .domain(legendSizes)
            .range([
                d3.min(sizes)+1, 
                (d3.max(sizes) - d3.min(sizes))/ 2,
                d3.max(sizes)
        ]);
        
        // add the text next to the labels
        legend.selectAll("text")
            .data(legendSizes)
            .enter()
            .append("text")
            .attr("x", 90)
            .attr("y", function(d, i) { 
                return 40*i+100; 
            })
            .text(function(d) { 
                return legendText(d) + " double faults"; 
            })
            .attr("font-size", "13px")
            .style('font-family', 'Comic Sans MS')
            .attr("alignment-baseline", "middle");
    });

}

var viz5=function(filePath){

    d3.csv(filePath).then(function(data){

        var margin = {
            top: 100, right: 30, bottom: 300, left: 550
        },
        width = 1500 - margin.left - margin.right,
        height = 900 - margin.top - margin.bottom;

        var svg = d3.select("#v5_plot")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        var plot_data = data.map(d=>{return +d.return_pts})

        // boxplot stats
        var data_sorted = plot_data.sort(d3.ascending)

        var q1 = d3.quantile(data_sorted, .25)
        var q3 = d3.quantile(data_sorted, .75)
        var interQuantileRange = q3 - q1

        var median = d3.quantile(data_sorted, .5)
        var min = q1 - 1.5 * interQuantileRange
        var max = q1 + 1.5 * interQuantileRange

        // Create the y-axis
        // buffer = 3
        var y = d3.scaleLinear()
                .domain([min,max])
                .range([height, 0]);
        
        svg.call(d3.axisLeft(y))
            .style('font-family', 'Comic Sans MS')
            .style('font-size', 13)

        
        var center = 200
        var width = 100

        // Vertical line
        svg.append("line")
            .attr("x1", center)
            .attr("x2", center)
            .attr("y1", y(min) )
            .attr("y2", y(max) )
            .attr("stroke", "black")
            .attr("stroke-width", 2.5)

        // Box of the boxplot
        svg.append("rect")
            .attr("x", center - width/2)
            .attr("y", y(q3) )
            .attr("height", (y(q1)-y(q3)) )
            .attr("width", width )
            .attr("stroke", "black")
            .attr("stroke-width", 2.5)
            .style("fill", "#4CAF50") // setting the color to Wimbeldon Purple

        // show remaining lines
        dat = [min, median, max]
        svg.selectAll("toto")
            .data(dat)
            .enter()
            .append("line")
            .attr("x1", center-width/2)
            .attr("x2", center+width/2)
            .attr("y1", function(d){ 
                return(y(d))
            })
            .attr("y2", function(d){ 
                return(y(d))
            })
            .attr("stroke", "black")
            .attr("stroke-width", 4)


        // Add title
        text_buffer = -120;
        svg.append('text')
            .attr('x', width/2 - text_buffer)
            .attr('y', height-text_buffer)
            .attr('text-anchor', 'middle')
            .style('font-size', "30px")
            .text('Return Points Won Per Match (2010)')
            .style('font-family', 'Comic Sans MS')
            .style('fill', "#240046")


        // Label the y-axis
        x_shift_factor = 200
        y_shift_factor = 890
        svg.append('text')
            .attr("transform", "rotate(-90)")
            .attr('x', -x_shift_factor)
            .attr('y', height + margin.bottom-y_shift_factor)
            .style('font-size', "20px")
            .text('Return Points') 
            .style('font-family', 'Comic Sans MS')
            .style('fill', "#240046")
    });
    
       

}