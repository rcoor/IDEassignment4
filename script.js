// set the dimensions and margins of the graph
var margin = { top: 20, right: 60, bottom: 30, left: 50 },
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Get and transform hands_pca data into x and y coordinates
function getPCAHands(callback) {
    d3.text("./hands_pca.csv", function (text) {
        var data = d3.csvParseRows(text).map(function (row) {

            var rowItem = row.map(function (value) {
                return +value;
            }).splice(0, 2);

            return { 'x': rowItem[0], 'y': rowItem[1], 'selected': false };
        });
        callback(data);
    });
};

// Get and transform hands data into x and y coordinates
function getHands(callback) {
    d3.text("./hands.csv", function (text) {
        lastArray = [];
        var data = d3.csvParseRows(text).map((row) => {

            var rowItem = row.map((value) => {
                return +value;
            });

            rowX = rowItem.splice(0, 56);
            rowY = rowItem;

            array = [];
            rowX.forEach((d, i) => {
                array[i] = { 'x': rowX[i], 'y': rowY[i] };
            });
            lastArray.push(array);
        });
        callback(lastArray);
    });
}

// Use callback to get the formatted data
getPCAHands((PCAhands) => {
    scatterPCA(PCAhands);
});

var handSVG = createHandSvg();

// text
handSVG.append("text")
    .text("Select a hand")
    .attr("x", (width / 2) - 60)
    .attr("y", height / 2);

handSVG.append("text")
    .text("The plot shows an outline of hands")
    .attr("x", -20)
    .attr("y", height - 20);

handSVG.append("text")
    .text("from a dataset of 40 hands.")
    .attr("x", -20)
    .attr("y", height);

// draw multiple hands
var multipleHands = createMultipleHands();

function scatterPCA(data) {

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var svg = d3.select("svg.pca")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    svg.append("text")
        .text("PC 2")
        .attr("x", width / 2 - 20)
        .attr("y", height + margin.bottom);

    svg.append("text")
        .text("PC 1")
        .attr("x", - width / 2)
        .attr("transform", "rotate(-90)")
        .attr("y", -20);

    // text inside the PCA plot
    var xPos = 20;
    var yPos = 50;
    svg.append("text")
        .text("40 hands")
        .attr("x", xPos)
        .attr("y", yPos)
        .attr("class", "inPlotText")

    svg.append("text")
        .text("Select a hand to draw its outline")
        .attr("x", xPos)
        .attr("y", yPos + 20)
        .attr("class", "inPlotTextExplanation")


    // Scale the range of the data
    x.domain(d3.extent(data, (d) => { return d.x; }));
    y.domain([d3.min(data, (d) => { return d.y; }), d3.max(data, (d) => { return d.y; })]);

    // Add the scatterplot
    var circles = svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "circle")
        .attr("cx", (d) => { return x(d.x); })
        .attr("cy", (d) => { return y(d.y); })

    // style the circles
    var circleStyling = (circles) => {
        circles.attr("r", 4)
            .classed("selected", false);
    }

    // set size of circles
    circleStyling(circles);

    circles
        .on("click", function (d, i) {
            // reset circle sizes
            circleStyling(circles);
            d3.select(this).attr("r", 5)
                .classed("selected", true);

            svg.select("g").remove();
            svg.append("g").append("circle")
                .attr("class", "circleSelect")
                .attr("cx", x(d.x))
                .attr("cy", y(d.y))
                .attr("r", 4);

            plotHand(i, handSVG, height, width);

           /* d3.select("svg.allHands")
                .each(function (d) { console.log(d) });*/
                d3.selectAll(d3.select(multipleHands)).each(function(d) {console.log(d)});
        });
}

function createMultipleHands() {
    var height = 220;
    var svg = d3.select("svg.allHands")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    svg.append("text")
        .text("Show of hands: 40 hand outlines")
        .attr("x", 0)
        .attr("y", 20)

    count = 0;
    maxCount = 8;
    countY = 0;
    maxCountY = 40 / maxCount;
    for (i = 0; i < 40; i++) {
        var newHeight = (height / maxCountY);
        var newWidth = (width / maxCount);
        svg2 = svg.append("svg")
            .attr("width", newWidth)
            .attr("height", newHeight)
            .attr("x", newWidth * count)
            .attr("y", newHeight * countY + 40)
            .attr("class", "handsOverview");
        plotHand(i, svg2, newHeight, newWidth);
        if (count >= maxCount - 1) {
            countY += 1;
        }
        console.log(countY);
        count = count >= maxCount - 1 ? 0 : count += 1;

    }
    return svg;
}



function createHandSvg() {
    return svg = d3.select("svg.hands")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
}

function plotHand(id, svg, height, width) {
    getHands((hands) => {
        svg.selectAll("path").remove();
        svg.select("g").remove();
        var data = hands[id];



        // set the ranges
        var x = d3.scaleLinear().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);


        // Scale the range of the data
        x.domain(d3.extent(data, (d) => { return d.x; }));
        y.domain([0, d3.max(data, (d) => { return d.y; })]);

        // Add the scatterplot
        svg.append("g")
            .selectAll("dot")
            .data(data)
            .enter().append("circle")
            .attr("r", 1)
            .attr("cx", (d) => { return x(d.x); })
            .attr("cy", (d) => { return y(d.y); });

        // define the line
        var lineGenerator = d3.line()
            .x((d) => { return x(d.x); })
            .y((d) => { return y(d.y); })
            .curve(d3.curveCardinal);
        // Add the valueline path.
        svg.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", lineGenerator)
            .attr('stroke-dasharray', '2400 2400')
            .attr('stroke-dashoffset', 2400)
            .transition()
            .duration(1000)
            .attr('stroke-dashoffset', 0);
    });
}
