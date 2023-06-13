// Request to get the data from the api

const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

var w = 800;
var h = 400;
var barWidth = w / 275;

var tooltip = d3
  .select("#container")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

var overlay = d3
  .select("#container")
  .append("div")
  .attr("class", "overlay")
  .style("opacity", 0);

var svg = d3
  .select("#container")
  .append("svg")
  .attr("width", w + 100)
  .attr("height", h + 60);

d3.json(url).then((data) => {
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -200)
    .attr("y", 80)
    .text("Gross Domestic Product")
    .style("fill", "#8B0000");

  svg
    .append("text")
    .attr("x", w / 2 + 120)
    .attr("y", h + 50)
    .text("More Information: http://www.bea.gov/national/pdf/nipaguid.pdf")
    .attr("class", "info")
    .style("fill", "#8B0000");

  // getting the data in the format of year + fiscal quarter
  var years = data.data.map(function (d) {
    var quarter;
    var month = d[0].substring(5, 7);
    if (month === "01") {
      quarter = "Q1";
    } else if (month === "04") {
      quarter = "Q2";
    } else if (month === "07") {
      quarter = "Q3";
    } else if (month === "10") {
      quarter = "Q4";
    }
    return d[0].substring(0, 4) + " " + quarter;
  });

  // setting xScale
  var yearsDate = data.data.map((d) => {
    return new Date(d[0]);
  });

  var xMax = new Date(d3.max(yearsDate));
  xMax.setMonth(xMax.getMonth() + 3);
  var xScale = d3
    .scaleTime()
    .domain([d3.min(yearsDate), xMax])
    .range([0, w]);

  // setting & appending xAxis
  var xAxis = d3.axisBottom().scale(xScale);
  svg
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", "translate(60, 400)");

  // getting the gdp data ready
  var GDP = data.data.map((d) => {
    return d[1];
  });

  var scaledGDP = [];
  var maxGDP = d3.max(GDP);
  var linearScale = d3.scaleLinear().domain([0, maxGDP]).range([0, h]);
  scaledGDP = GDP.map((d) => {
    return linearScale(d);
  });
  // setting yScale, yAxis & appending yAxis
  var yScale = d3.scaleLinear().domain([0, maxGDP]).range([h, 0]);
  var yAxis = d3.axisLeft(yScale);
  svg
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("transform", "translate(60, 0)");

  d3.select("svg")
    .selectAll("rect")
    .data(scaledGDP)
    .enter()
    .append("rect")
    .attr("data-date", (d, i) => {
      return data.data[i][0];
    })
    .attr("data-gdp", (d, i) => {
      return data.data[i][1];
    })
    .attr("class", "bar")
    .attr("x", (d, i) => {
      return xScale(yearsDate[i]);
    })
    .attr("y", (d) => h - d)
    .attr("width", barWidth)
    .attr("height", (d) => d)
    .attr("index", (d, i) => i)
    .attr("fill", "#BFE5D9")
    .attr("transform", "translate(60, 0)");

  // customising tooltip and overlay
  d3.selectAll("rect")
    .on("mouseover", function (event, d) {
      var i = this.getAttribute("index");

      overlay
        .transition()
        .duration(0)
        .style("height", d + "px")
        .style("width", barWidth + "px")
        .style("opacity", 0);
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(years[i] + "<br>" + "$" + GDP[i].toFixed(1) + " Billion")
        .attr("data-date", data.data[i][0])
        .style("left", i * barWidth + 30 + "px")
        .style("top", h - 100 + "px")
        .style("fill", "pink");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(200).style("opacity", 0);
      overlay.transition().duration(200).style("opacity", 0);
    });
});
