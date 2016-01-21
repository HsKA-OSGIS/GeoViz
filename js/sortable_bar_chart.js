/**
Arguments:
----------
div:
id of div-tag the svg element should be appended to (including '#') as string, e.g. '#svg'

filenames:
csv-file with data to visualize, e.g. "../data/file.csv"

attributes:
array with three (!) attribute names (fields in csv) that are used to create the chart,
first entry is always used for the x-axis
the other two entries are used to create the two bars
[2. entry = left bar, 3. entry = right bar]
e.g. ["NAME","Value1","Value2"] [limited to 2 bars]
advantage of this chart: attributes with different units can be properly displayed in one chart!

attributes_tooltip:
Needed for the tooltip of the bars, array of two arrays,
these subarrays always consist of two entries:
1.) string for tooltip of bars
2.) string of unit
e.g.[["Value 1 Average", "m"], ["Value 2 Average", "km"]]

domain:
array of the maximum value of both fields,
e.g. [max. value of "Value1", max. value of "Value2"]

y_axis_annotation:
array of string for the annotation of the y-Axis,
first entry: left bar = left y-Axis, second entry: right bar = right y-Axis
in this case e.g. ["Average Value 1 [m]", "Average Value 2 [km]"]
**/
//based on: http://bl.ocks.org/mbostock/3885705
function drawSortableBarChart(div,filename,attributes,attributes_tooltip,y_axis_annotation) {
var margin = {top: 70, right: 50, bottom: 230, left: 80},
    width = 960 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

//var formatyAxis = d3.format(".0%");
var formatyAxis = d3.format(".4n");

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1, 1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(formatyAxis);
	
// Tooltip:
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return attributes_tooltip[0] + " in " + d.value_x + ": " + d.value_y + " " + attributes_tooltip[1];
  });

/*If div already contains a svg element -> clear it:
if (boolean_clearDiv == true) {
	clearDiv(div);
}*/

var svg = d3.select(div).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
svg.call(tip);

//d3.csv("/GeoViz/data/processed_data/adm/DEU_adm2_pa_clip_total_statistics_fixed.csv", function(error, data) {
d3.csv(filename, type, function(error, data) {

  

  //x.domain(data.map(function(d) { return d.letter; }));
  //y.domain([0, d3.max(data, function(d) { return d.frequency; })]);
  x.domain(data.map(function(d) { return d.value_x; }));
  y.domain([0, d3.max(data, function(d) { return d.value_y; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis) //;
	  //new:
	  .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-50)");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      //.text("Frequency");
	  .text(y_axis_annotation);

  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      /*.attr("x", function(d) { return x(d.letter); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.frequency); })
      .attr("height", function(d) { return height - y(d.frequency); });*/
	  .attr("x", function(d) { return x(d.value_x); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.value_y); })
      .attr("height", function(d) { return height - y(d.value_y); })
	  //new tooltip:
      .on('mouseover', tip.show)										// event for tooltip
      .on('mouseout', tip.hide);										// event for tooltip

  d3.select("input").on("change", change);

  /*var sortTimeout = setTimeout(function() {
    d3.select("input").property("checked", true).each(change);
  }, 2000);*/

  function change() {
    //clearTimeout(sortTimeout);

    // Copy-on-write since tweens are evaluated after a delay.
    var x0 = x.domain(data.sort(this.checked
		/*? function(a, b) { return b.frequency - a.frequency; }
        : function(a, b) { return d3.ascending(a.letter, b.letter); })
        .map(function(d) { return d.letter; }))
        .copy();*/
        ? function(a, b) { return b.value_y - a.value_y; }
        : function(a, b) { return d3.ascending(a.value_x, b.value_x); })
        .map(function(d) { return d.value_x; }))
        .copy();

    svg.selectAll(".bar")
		//.sort(function(a, b) { return x0(a.letter) - x0(b.letter); });
        .sort(function(a, b) { return x0(a.value_x) - x0(b.value_x); });

    var transition = svg.transition().duration(750),
        delay = function(d, i) { return i * 50; };

    transition.selectAll(".bar")
        .delay(delay)
		//.attr("x", function(d) { return x0(d.letter); });
        .attr("x", function(d) { return x0(d.value_x); });

    //Update x-axis:
	transition.select("g.x.axis")
        .call(xAxis)
		.selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-50)")
      .selectAll("g")
        .delay(delay);
  }
});
//Change function type to get right values:
function type(d) {
  d.value_x = d[attributes[0]];
  d.value_y = +d[attributes[1]];
  return d;
}

//clear div of chart:
function clearDiv(div)
{
    //document.getElementById(div).innerHTML = "";
	var div = document.getElementById('cart_item');
	while(div.firstChild){
		div.removeChild(div.firstChild);
	}
	svg.selectAll("*").remove();
}
}
