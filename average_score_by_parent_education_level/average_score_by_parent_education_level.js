// Set the dimensions and margins of the graph
const margin = {top: 20, right: 30, bottom: 40, left: 150},
      width = 960 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// Append the svg object to the body of the page
const svg = d3.select("#bar-chart")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

// Initialize tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

// Education levels ordered
const educationLevels = [
  "high school",
  "some high school",
  "some college",
  "associate's degree",
  "bachelor's degree",
  "master's degree"
];

// Title
svg
  .append("text")
  .attr("x", width / 4)
  .attr("y", 0)
  .style("font-size", "15x")
  .style("text-decoration", "underline")
  .text("Overall Average Score with Respect to Parent's Edcuation Level");

// Load the data
d3.csv("../datasets/study_performance.csv").then(data => {
  // Calculate average scores for each parent's education level
  const averages = educationLevels.map(level => {
    const totalValues = data.filter(d => d.parental_level_of_education === level).map(d => +d.total_avg_score);
    const mathValues = data.filter(d => d.parental_level_of_education === level).map(d => +d.math_score);
    const readingValues = data.filter(d => d.parental_level_of_education === level).map(d => +d.reading_score);
    const writingValues = data.filter(d => d.parental_level_of_education === level).map(d => +d.writing_score);
    
    const totalAverage = totalValues.reduce((acc, curr) => acc + curr, 0) / totalValues.length;
    const mathAverage = mathValues.reduce((acc, curr) => acc + curr, 0) / mathValues.length;
    const readingAverage = readingValues.reduce((acc, curr) => acc + curr, 0) / readingValues.length;
    const writingAverage = writingValues.reduce((acc, curr) => acc + curr, 0) / writingValues.length;

    return { parental_level_of_education: level, 
      total_average: totalAverage, 
      math_average: mathAverage, 
      reading_average: readingAverage, 
      writing_average: writingAverage };
  });

  // X axis
  const x = d3.scaleLinear()
      .domain([0, 80])
      .range([0, width]);
  svg.append("g")
      .attr("transform", `translate(0,${height+5})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
        .style("text-anchor", "left");

  // Y axis
  const y = d3.scaleBand()
      .range([10, height])
      .domain(educationLevels)
      .padding(.1);
  svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
        .style("font-size", "12px");

  // Bars
  svg.selectAll("myRect")
    .data(averages)
    .enter()
    .append("rect")
      .attr("x", x(0))
      .attr("y", d => y(d.parental_level_of_education))
      .attr("width", d => x(d.total_average))
      .attr("height", y.bandwidth())
      .attr("class", "bar")
      .on("mouseover", function(event, d) {
        tooltip.html(`Math Avg Score: ${d.math_average.toFixed(2)}<br/>Reading Avg Score: ${d.reading_average.toFixed(2)}<br/>Writing Avg Score: ${d.writing_average.toFixed(2)}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY + 10) + "px")
            .style("opacity", 1);
      })
      .on("mouseout", function(d) {
        tooltip.style("opacity", 0);
      });

  // Adding labels for the averages
  svg.selectAll(".text")
    .data(averages)
    .enter()
    .append("text")
      .attr("class", "label")
      .attr("x", d => x(d.total_average) - 3)
      .attr("y", d => y(d.parental_level_of_education) + y.bandwidth() / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text(function(d) { return 'All Subjects Average Score: ' + d.total_average.toFixed(2); });
});
