/*
 * This file contains the function that renders the ForceDirected node-link diagram
 * As input, it takes a set of nodes and links that represent the graph,
 * the svg object in which it should be rendered and an array containing the info about the attributes
 * (e.g. node radius, ndoe color, link width)
 * Attributes elements: [link width, link opacity, node size/radius, node color]
 */

function loadForceGraph(nodes, links, svg, attributes) {
	
	//clear svg
	svg.selectAll("*").remove()

	// Initialize variables
	var manyBody = d3.forceManyBody()
	var collision = d3.forceCollide(5)

	// Initialize simulation
	 var simulation = d3.forceSimulation()
		.force("link", d3.forceLink().id(function(d) { return d.id; }))
		.force("charge", manyBody)
		.force("collision", collision)
		
    
	var color = d3.scaleOrdinal(d3.schemeCategory20);

  	console.log("showing static graph")
	
    width = +svg.attr("width"),
    height = +svg.attr("height");
	
	
	//load data in arrays
	vertices = nodes
	edges = links 
	
	//initialize simulation
	simulation = d3.forceSimulation()
    .force("link", d3.forceLink()
	.id(function(d) { return d.id; })
	.iterations(0.01))
    .force("charge", manyBody)
    .force("center", d3.forceCenter(width / 2, height / 2))
	.force("collision", collision);

	//determine minimum weight of edges to show
	minWeight = 0
	if (edges.length > 80000) {
		//calculate weight of 80000th largest element to use as minimum weight IMPROVE TO NOT USE SORT
		var edgeWeights = []
		for (var ed in edges) {
			edgeWeights.push(edges[ed].value)
		}
		minWeight = edgeWeights.sort(function(a,b) {return b - a})[80000]
	}
		
	//set edge appearance group
	link = svg.append("g")
	  .attr("stroke", "#000")
	  .attr("stroke-width", 0.3)
	  .attr("stroke-opacity", 0.4)

	
	 //set node appearance group
	node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)

		
	//add vertices and edges to force simulation
	simulation
		.nodes(vertices)
		.force("link").links(edges)	
	
	
	//optimalization settings
	manyBody.theta(5)
	manyBody.distanceMax(2000)
	collision.iterations(0.01)
	simulation.velocityDecay(0.8)
	simulation.alphaDecay(0.01)
	
	console.log("Start simulation")
	//do 150 steps of the simulation
	for (var i = 0; i <= 150; i++) {
		simulation.tick()
	}
	console.log("Simulation done")
	simulation.stop()
	
	//and then display the state of the simulation
	drawGraph(minWeight)

//draw the Graph based on the current state of the simulation
  function drawGraph(minWeight) {
	  //counter holds how many edges are drawn
		var counter = 0;
		
		console.log("Showing edges higher then: " + minWeight);
		
		//for each edge, draw only if its weight is high enough
		for (var ed in edges) {
			ed = edges[ed]
			if (ed.value >= minWeight) {
			counter ++
			link.append("line")
				.attr("x1", ed.source.x )
				.attr("y1", ed.source.y )
				.attr("x2", ed.target.x )
				.attr("y2", ed.target.y )
				.attr("stroke-opacity", Math.sqrt(ed.value) / 5) 
				.attr("stroke-width", Math.sqrt(ed.value) / 5) ;
			}
		}
		
		//draw each node
		for (var no in vertices) {
		nod = vertices[no]
		node.append("circle")
			.attr("cx", nod.x)
			.attr("cy", nod.y)
			.attr("r", 2)
			.attr("fill", "#0080ff")
			.on("click", function(d) {console.log(d)})
		}
		console.log("Showing " + counter + " edges")
		console.log("done")
  }
	


    // Zooming and panning function
    zoomed = () => {
        const {x,y,k} = d3.event.transform
        let t = d3.zoomIdentity
        t = t.translate(x,y).scale(k).translate(50,50)

        let g = svg.selectAll("g")
        g.attr("transform", t)
    }
    let zoom = d3.zoom()
        .scaleExtent([0.01, 10])
        .on("zoom", zoomed);
    svg.call(zoom);

}

