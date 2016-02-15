//js for line chart
function lineChart (el,json_file){
	var margin = {top: 20, right: 20, bottom:80, left: 50},
			width = 900 - margin.left - margin.right,
			height = 500 - margin.top - margin.bottom;

	var formatDate = d3.time.format("%d-%b-%y");

	var x = d3.time.scale()
			.range([0, width]);

	var y = d3.scale.linear()
			.range([height, 0]);

	var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom")
			.tickFormat(d3.format("Y"));

	var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");

	var line = d3.svg.line()
			.interpolate("cardinal")
			.x(function(d) { return x(d.x); })
			.y(function(d) { return y(d.y); });

	var svg = d3.select(el).append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.json(json_file, function(error, data) {
		if (error) throw error;
		data.forEach(function(d) {
			d.x = d.x;//for x axis data
			d.y = +d.y;//for y axis data
		});
		x.domain(d3.extent(data, function(d) { return d.x; }));
		y.domain(d3.extent(data, function(d) { return d.y; }));

		svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis);

		svg.append("g")
				.attr("class", "y axis")
				.call(yAxis)
			.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("GDP growth (annual %)");

		svg.append("path")
				.datum(data)
				.attr("class", "line")
				.attr("d", line);
	});
};

//js for stack bar chart

function stackBar(el,json_file){
		var margin = {top: 32, right: 20, bottom:200, left: 40},
		    width = 900 - margin.left - margin.right,
		    height = 600 - margin.top - margin.bottom;

		var x = d3.scale.ordinal()
		    .rangeRoundBands([0, width], .4);

		var y = d3.scale.linear()
		    .rangeRound([height, 0]);

		var color = d3.scale.ordinal()
		    .range(["#ff3333", "#330000"]);

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
		    .tickFormat(d3.format(".2s"));

		var svg = d3.select(el).append("svg")
		    .attr("width", width + margin.left + margin.right )
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		d3.json(json_file, function(error, data) {
		  if (error) throw error;

		  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Country"; }));

		  data.forEach(function(d) {
		    var y0 = 0;
		    d.prod = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
		    d.total = d.prod[d.prod.length - 1].y1;
		  });

		  // data.sort(function(a, b) { return b.total - a.total; });

		  x.domain(data.map(function(d) { return d.Country; }));
		  y.domain([0, d3.max(data, function(d) { return d.total; })]);


			//code for tooltip
			var tip = d3.tip()
						.attr('class', 'd3-tip')
						.offset([-10, 0])
						.html(function(d) {
							return "<strong>Values(US$):</strong> <span style='color:red'>" + d.y1 + "</span>";
						});

			svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis)
					.selectAll("text")
					.style("text-anchor", "end")
					.attr("dx", "-.8em")
					.attr("dy", "-.55em")
					.attr("transform", "rotate(-45)" );

					//call tooltip
					svg.call(tip);

		  svg.append("g")
		      .attr("class", "y axis")
		      .call(yAxis)
		    .append("text")
		      .attr("transform", "rotate(-90)")
		      .attr("y", 6)
		      .attr("dy", ".71em")
		      .style("text-anchor", "end")
		      .text("Values(US$)");

		  var year = svg.selectAll(".year")
		      .data(data)
		    .enter().append("g")
		      .attr("class", "g")
		      .attr("transform", function(d) { return "translate(" + x(d.Country) + ",0)"; });

		  year.selectAll("rect")
		      .data(function(d) { return d.prod; })
		    .enter().append("rect")
		      .attr("width", x.rangeBand())
		      .attr("y", function(d) { return y(d.y1); })
		      .attr("height", function(d) { return y(d.y0) - y(d.y1); })
		      .style("fill", function(d) { return color(d.name); })
					.on('mouseover', tip.show)
					.on('mouseout', tip.hide);

		  var legend = svg.selectAll(".legend")
		      .data(color.domain().slice().reverse())
		      .enter().append("g")
		      .attr("class", "legend")
		      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		  legend.append("rect")
		      .attr("x", width + 10)
					.attr("y", "30px")
		      .attr("width", 18)
		      .attr("height", 18)
		      .style("fill", color);

		  legend.append("text")
		      .attr("x", width + 8)
		      .attr("y", 9)
		      .attr("dy", "30px")
		      .style("text-anchor", "end")
		      .text(function(d) { return d; });

		});
	};

//js for multiline chart
function multiLine(el,json_file){
		var margin = {top: 50, right: 20, bottom: 30, left: 40},
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


		var x = d3.time.scale()
		    .range([0, width]);

		var y = d3.scale.linear()
		    .range([height, 0]);

		var color = d3.scale.ordinal()
		    .range(["#992600", "#999900","#990099","#002699","#00bfff","#248f24"]);

		var xAxis = d3.svg.axis()
		      .scale(x)
		      .orient("bottom")
		      .tickFormat(d3.format("Y"));
		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
				.tickFormat(d3.format(".2s"));

		var line = d3.svg.line()
		    .interpolate("basis")
		    .x(function(d) { return x(d.year); })
		    .y(function(d) { return y(d.temperature); });

		var svg = d3.select(el).append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		d3.json(json_file, function(error, data) {
		  if (error) throw error;

		  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "year"; }));

		  data.forEach(function(d) {
		    //d.year = parseyear(d.year);
		  });

		  var cities = color.domain().map(function(name) {
		    return {
		      name: name,
		      values: data.map(function(d) {
		        return {year: d.year, temperature: +d[name]};
		      })
		    };
		  });

		  x.domain(d3.extent(data, function(d) { return d.year; }));

		  y.domain([
		    d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
		    d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
		  ]);

		  svg.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + height + ")")
		      .call(xAxis);

		  svg.append("g")
		      .attr("class", "y axis")
		      .call(yAxis)
		    .append("text")
		      .attr("transform", "rotate(-90)")
		      .attr("y", 6)
		      .attr("dy", ".71em")
		      .style("text-anchor", "end")
		      .text("Values(US$)");

		  var city = svg.selectAll(".city")
		      .data(cities)
		    .enter().append("g")
		      .attr("class", "city");

		  city.append("path")
		      .attr("class", "line")
		      .attr("d", function(d) { return line(d.values); })
		      .style("stroke", function(d) { return color(d.name); });

			var legend = svg.selectAll(".legend")
		      .data(color.domain().slice().reverse())
		      .enter().append("g")
		      .attr("class", "legend")
		      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		  legend.append("rect")
		      .attr("x", width + 10)
					.attr("y", "-30px")
		      .attr("width", 18)
		      .attr("height", 18)
		      .style("fill", color);

		  legend.append("text")
		      .attr("x", width + 8)
		      .attr("y", 9)
		      .attr("dy", "-28px")
		      .style("text-anchor", "end")
		      .text(function(d) { return d; });
		});

	};
