// Set dimensions and margins for the graph
const margin = {top: 15, right: 30, bottom: 30, left: 40},
    width = 560 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Append the svg object to the body of the page
const svg = d3.select("#math_histogram")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute");

// Title
svg
  .append("text")
  .attr("x", width / 4)
  .attr("y", 0)
  .style("font-size", "15x")
  .style("text-decoration", "underline")
  .text("Math Score Distribution by Gender");

// Load data
d3.csv("../datasets/study_performance.csv").then(function(data) {
    // Filter data for males and females separately
    const maleScores = data.filter(d => d.gender === 'male').map(d => +d.math_score);
    const femaleScores = data.filter(d => d.gender === 'female').map(d => +d.math_score);

    // X axis: scale and draw
    const x = d3.scaleLinear()
        .domain([0, 100])     // d3.extent(data, function(d) { return d.math_score; }) for dynamic scale
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
      .append("text")
        .attr("class", "axis-label")
        .attr("y", 30)
        .attr("x", width / 2 + 25)
        .attr("text-anchor", "end")
        .text("Math Score");

    // Set the parameters for the histogram
    const histogram = d3.histogram()
        .value(function(d) { return d; })   // I need to give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(x.ticks(40)); // then the numbers of bins

    // And apply this function to data to get the bins
    const binsMale = histogram(maleScores);
    const binsFemale = histogram(femaleScores);

    // Y axis: scale and draw:
    const y = d3.scaleLinear()
        .range([height, 30]);
    y.domain([0, d3.max(binsMale.concat(binsFemale), function(d) { return d.length; })]);   // d3.max(bins, function(d) { return d.length; }) for dynamic scale
    svg.append("g")
        .call(d3.axisLeft(y))
      .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -25)
        .attr("x", -height / 2 + 25)
        .attr("text-anchor", "end")
        .text("Number of Students");

    // Append the bars for the male histogram
    svg.selectAll("rect.male")
        .data(binsMale)
        .enter()
        .append("rect")
          .attr("x", 1)
          .attr("transform", function(d) { return `translate(${x(d.x0)},${y(d.length)})`; })
          .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
          .attr("height", function(d) { return height - y(d.length); })
          .style("fill", "#69b3a2")
          .attr("class", "bar male");

    // Append the bars for the female histogram
    svg.selectAll("rect.female")
        .data(binsFemale)
        .enter()
        .append("rect")
          .attr("x", 1)
          .attr("transform", function(d) { return `translate(${x(d.x0)},${y(d.length)})`; })
          .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
          .attr("height", function(d) { return height - y(d.length); })
          .style("fill", "#ff9896")
          .attr("class", "bar female");
    
    // Legend
    const colors = {male: "#69b3a2", female: "#ff9896"};
    const gender = ["male", "female"];
    svg.selectAll("mydots")  // Add one dot in the legend for each name.
      .data(gender)
      .enter()
      .append("circle")
        .attr("cx", 60)
        .attr("cy", function(d,i){ return 30 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function(d){ return colors[d]});

   // Each dot followed by each gender in the legend
   svg.selectAll("mylabels")
     .data(gender)
     .enter()
     .append("text")
       .attr("x", 80)
       .attr("y", function(d,i){ return 30 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
       .style("fill", function(d){ return colors[d]})
       .text(function(d){ return d})
       .attr("text-anchor", "left")
       .style("alignment-baseline", "middle")
       .style("cursor", "pointer") // Make it look clickable
     .on("click", function(event, selectedGender) {
           // On click, adjust the opacity of the bars based on the selected gender
           svg.selectAll(".bar")
               .style("opacity", function(d) {
                   const genderOfThisBar = d3.select(this).classed("male") ? "male" : "female";
                   return (selectedGender === genderOfThisBar) ? 1.0 : 0.2; // Highlight selected gender, fade the other
               });
       });

    // Tooltip interaction for bars
    svg.selectAll(".bar")
      .on("mouseover", function(event, data) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`Math Score: ${data.x0} - ${data.x1}<br/>Num of Students: ${data.length}`)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
        const selectedGender = d3.select(this).classed("male") ? "male" : "female";
        svg.selectAll(".bar")
        .style("opacity", function(d) {
            const genderOfThisBar = d3.select(this).classed("male") ? "male" : "female";
            return (selectedGender === genderOfThisBar) ? 1.0 : 0.2; // Highlight selected gender, fade the other
        });
      })
      .on("mouseout", function(d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
          svg.selectAll(".bar")
          .style("opacity", 0.6)
      });
});