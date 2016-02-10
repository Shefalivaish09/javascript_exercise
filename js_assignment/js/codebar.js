//js for bar chart
function myFunction (el,json_file,graph_color){
		var margin = {top: 40, right: 20, bottom: 200, left: 40},
					width =900 - margin.left - margin.right,
					height =600 - margin.top - margin.bottom,
					x = d3.scale.ordinal().rangeRoundBands([0, width],.4),
					y = d3.scale.linear().range([height, 0]),

					xAxis = d3.svg.axis()
					.scale(x)
					.orient("bottom")
					.tickSize(2),
					yAxis = d3.svg.axis()
					.scale(y)
					.orient("left")
					.ticks(15)
					.tickSize(2)
					.tickFormat(d3.format(".2s")),

					svg = d3.select(el).append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform","translate(" + margin.left + "," + margin.top + ")");


		   //read json file
					d3.json(json_file, function(error, data) {
					    data.forEach(function(d) {
								d.x = d.x;//for x axis data
								d.y = +d.y;//for y axis data
					    });

							x.domain(data.map(function(d) { return d.x; }));
							y.domain([0, d3.max(data, function(d) { return d.y; })]);

							//code for tooltip
							var tip = d3.tip()
										.attr('class', 'd3-tip')
										.offset([-10, 0])
										.html(function(d) {
											return "<strong>Production:</strong> <span style='color:red'>" + d.y + "</span>";
										});


							svg.append("g")
									.attr("class", "x axis")
									.attr("transform", "translate(0," + height + ")")
									.call(xAxis)
									.selectAll("text")
									.style("text-anchor", "end")
									.attr("dx", "-.8em")
									.attr("dy", "-.55em")
									.attr("transform", "rotate(-90)" );

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
									.text("Production(Ton mn)");



							svg.selectAll("bar")
									.data(data)
						   		.enter().append("rect")
									.style("fill", graph_color)
									.attr("x", function(d) { return x(d.x); })
									.attr("width", x.rangeBand())
									.attr("y", function(d) { return y(d.y); })
									.attr("height", function(d) { return height - y(d.y); })
									.on('mouseover', tip.show)
      						.on('mouseout', tip.hide);


						});
			};

		//js for stack bar chart

		function stackBar(el,json_file){
			var margin = {top: 32, right: 20, bottom: 70, left: 40},
			    width = 900 - margin.left - margin.right,
			    height = 500 - margin.top - margin.bottom;

			var x = d3.scale.ordinal()
			    .rangeRoundBands([0, width], .4);

			var y = d3.scale.linear()
			    .rangeRound([height, 0]);

			var color = d3.scale.ordinal()
			    .range(["#9999ff", "#3333ff", "#0000b3", "#000066"]);

			var xAxis = d3.svg.axis()
			    .scale(x)
			    .orient("bottom")
					.tickSize(2);

			var yAxis = d3.svg.axis()
			    .scale(y)
			    .orient("left")
					.tickSize(2)
			    .tickFormat(d3.format(".2s"));

			var svg = d3.select(el).append("svg")
			    .attr("width", width + margin.left + margin.right )
			    .attr("height", height + margin.top + margin.bottom)
			  .append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			d3.json(json_file, function(error, data) {
			  if (error) throw error;

			  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "year"; }));

			  data.forEach(function(d) {
			    var y0 = 0;
			    d.prod = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
			    d.total = d.prod[d.prod.length - 1].y1;
			  });

			  // data.sort(function(a, b) { return b.total - a.total; });

			  x.domain(data.map(function(d) { return d.year; }));
			  y.domain([0, d3.max(data, function(d) { return d.total; })]);


				//code for tooltip
				var tip = d3.tip()
							.attr('class', 'd3-tip')
							.offset([-10, 0])
							.html(function(d) {
								return "<strong>Production:</strong> <span style='color:red'>" + d.y1 + "</span>";
							});

				svg.append("g")
						.attr("class", "x axis")
						.attr("transform", "translate(0," + height + ")")
						.call(xAxis)
						.selectAll("text")
						.style("text-anchor", "end")
						.attr("dx", "-.8em")
						.attr("dy", "-.55em")
						.attr("transform", "rotate(-90)" );

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
			      .text("Production(kg/ha)");

			  var year = svg.selectAll(".year")
			      .data(data)
			    .enter().append("g")
			      .attr("class", "g")
			      .attr("transform", function(d) { return "translate(" + x(d.year) + ",0)"; });

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
						.attr("y", "-30px")
			      .attr("width", 18)
			      .attr("height", 18)
			      .style("fill", color);

			  legend.append("text")
			      .attr("x", width + 8)
			      .attr("y", 9)
			      .attr("dy", "-30px")
			      .style("text-anchor", "end")
			      .text(function(d) { return d; });

			});
	};
