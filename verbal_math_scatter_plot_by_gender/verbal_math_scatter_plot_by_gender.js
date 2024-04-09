// Scatter Plot Dimensions and Margins
const margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 700 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

// Create SVG Canvas
const svg = d3.select("#scatterplot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Tooltip for Hovering Over Points
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Title
svg
  .append("text")
  .attr("x", width / 3)
  .attr("y", 0)
  .style("font-size", "15x")
  .style("text-decoration", "underline")
  .text("Verbal Score VS. Math Score by Gender");

// Load Data
d3.csv("../datasets/study_performance.csv").then(function(data) {
    // Scale for X and Y Axes
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.verbal_avg_score)])
        .range([0, width]);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.math_score)])
        .range([height, 30]);

    // Append Axes to SVG
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
       .append("text")
        .attr("class", "axis-label")
        .attr("y", 30)
        .attr("x", width / 2 + 25)
        .attr("text-anchor", "end")
        .text("Verbal Score");
    svg.append("g")
        .call(d3.axisLeft(y))
       .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -25)
        .attr("x", -height / 2 + 25)
        .attr("text-anchor", "end")
        .text("Math Score");

    // Gender Colors
    const color = d3.scaleOrdinal()
        .domain(["male", "female"])
        .range(["#69b3a2", "#ff9896"]);

    // Draw Scatter Points
    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 4.0)
        .attr("cx", d => x(d.verbal_avg_score))
        .attr("cy", d => y(d.math_score))
        .style("fill", d => color(d.gender));
        
    
    // Function to Draw Trend Line
    function drawTrendLine(gender) {
        const dataFiltered = data.filter(d => d.gender === gender);

        // Calculate Linear Regression
        const lr = linearRegression(dataFiltered.map(d => +d.verbal_avg_score), dataFiltered.map(d => +d.math_score));

        // Draw Line
        svg.append("line")
            .attr("class", "line")
            .attr("x1", x(0))
            .attr("y1", y(lr.intercept))
            .attr("x2", x(d3.max(data, d => d.verbal_avg_score)))
            .attr("y2", y(lr.slope * d3.max(data, d => d.verbal_avg_score) + lr.intercept))
            .style("stroke", color(gender));
    }

    // Draw Trend Lines for Each Gender
    drawTrendLine("male");
    drawTrendLine("female");

    svg.selectAll(".dot")
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Verbal: ${d.verbal_avg_score}<br>Math: ${d.math_score}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
            d3.select(this).attr("r", 10)
                .style("opacity", 1.0)
                .style("stroke", "black");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            d3.select(this).attr("r", 4.0)
                .style("opacity", 0.6)
                .style("stroke", "transparent");
        });

    // Legend setup
    const legend = svg.selectAll(".legend")
    .data(color.domain()) // color domain from earlier, which is ["male", "female"]
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(80," + i * 25 + ")"; });

    // Draw legend colored rectangles
    legend.append("circle")
    .attr("cx", 20) // Positioning the rectangle
    .attr("cy", 40)
    .attr("r", 7)
    .style("fill", color);

    // Draw legend text
    legend.append("text")
    .attr("x", 35) // Positioning the text
    .attr("y", 38)
    .attr("dy", ".35em")
    .style("text-anchor", "left")
    .style("font-size", "15x")
    .style("fill", color)
    .text(function(d) { return d; });

});

// Linear Regression Function
function linearRegression(x, y) {
    const n = y.length;
    const sum_x = x.reduce((a, b) => a + b, 0);
    const sum_y = y.reduce((a, b) => a + b, 0);
    const sum_x2 = x.map(d => d * d).reduce((a, b) => a + b, 0);
    const sum_xy = x.map((d, i) => d * y[i]).reduce((a, b) => a + b, 0);
    
    const slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x);
    const intercept = (sum_y - slope * sum_x) / n;

    return {slope, intercept};
}
