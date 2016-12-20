// set the dimensions and margins of the graph
var margin = { top: 20, right: 60, bottom: 30, left: 50 },
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Get and transform hands_pca data into x and y coordinates
function getPCAHands(callback) {
    var c = 0;
    d3.text("./hands_pca.csv", function (text) {
        var data = d3.csvParseRows(text).map(function (row) {

            var rowItem = row.map(function (value) {
                return +value;
            }).splice(0, 2);
            c += 1;
            return { 'x': rowItem[0], 'y': rowItem[1], 'selected': false, 'label': c };
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
    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    /*    clusterArray = []
        data.forEach(x => {
            clusterArray.push([x.x, x.y]);
        });

        var clusters = clusterfck.hcluster(clusterArray, clusterfck.EUCLIDEAN_DISTANCE,
            clusterfck.AVERAGE_LINKAGE, 3);

        console.log(clusters);*/

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
        .text("Principal Component 2")
        .attr("x", width / 2 - 50)
        .attr("y", height + margin.bottom-5);

    svg.append("text")
        .text("Principal Component 1")
        .attr("x", - width / 2-50)
        .attr("transform", "rotate(-90)")
        .attr("y", -20);

    // text inside the PCA plot
    var xPos = 10;
    var yPos = 10;
    svg.append("text")
        .text("40 hands")
        .attr("x", xPos)
        .attr("y", yPos)
        .attr("class", "inPlotText")

    svg.append("text")
        .text("Select a hand to draw its outline")
        .attr("x", xPos)
        .attr("y", yPos + 20)
        .attr("class", "inPlotTextExplanation");

    svg.append("text")
        .text("Either click or drag starting from a point")
        .attr("x", xPos)
        .attr("y", yPos + 40)
        .attr("class", "inPlotTextExplanation");
    // add selection tool
    selectionTool(svg);

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
        .on("mouseover", function (d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("index: <b>" +d.label + "</b>")
                .style("left", (d3.event.pageX - 28) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

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

            plotHand(i, handSVG, height, width, 'largeHand', true);

            d3.selectAll("path.line")
                .style("fill", "white");
            d3.select("path.line.id" + i)
                .style("fill", "#EF9A9A");
        });


    function choosePointsWithSelection(start, end) {
        d3.selectAll("path.line")
            .style("fill", "white");

        /*        svg.selectAll("path").remove();
                svg.selectAll("g").remove();*/
        d3.selectAll("circle.circle")
            .each(function (point, i) {
                d3.select(this).classed("selected", false);
                if (isInBox(start, end, [x(point.x), y(point.y)])) {
                    plotHand(i, handSVG, height, width, 'largeHand', false);
                    d3.select(this).classed("selected", true);
                    d3.select("path.line.id" + point.label)
                        .style("fill", "#EF9A9A");
                }
            });
    }

    function isInBox(start, end, point) {
        const advFluffer = start[0];
        if (start[0] > end[0]) {
            start[0] = end[0];
            end[0] = advFluffer;
        };


        /*    const fluffer = start;
            if (start[1] < end[1]) {
                start = end;
                end = fluffer;
            };*/

        /*    if (start[1] < end[1]) {
                start = end;
                end = fluffer;
            };*/

        if (start[0] <= point[0] && point[0] <= end[0] && start[1] <= point[1] && point[1] <= end[1])
            return true;
        return false;
    }


    function selectionTool(svg) {
        function rect(x, y, w, h) {
            return "M" + [x, y] + " l" + [w, 0] + " l" + [0, h] + " l" + [-w, 0] + "z";
        }
        var selection = svg.append("path")
            .attr("class", "selection")
            .attr("visibility", "hidden");

        var startSelection = function (start) {
            selection.attr("d", rect(start[0], start[0], 0, 0))
                .attr("visibility", "visible");
        };

        var moveSelection = function (start, moved) {
            selection.attr("d", rect(start[0], start[1], moved[0] - start[0], moved[1] - start[1]));
        };

        var endSelection = function (start, end) {
            selection.attr("visibility", "hidden");
            choosePointsWithSelection(start, end);
        };

        svg.on("mousedown", function () {
            var subject = d3.select(window), parent = this.parentNode,
                start = d3.mouse(parent);
            startSelection(start);
            subject
                .on("mousemove.selection", function () {
                    console.log(parent);
                    moveSelection(start, d3.mouse(parent));
                }).on("mouseup.selection", function () {
                    endSelection(start, d3.mouse(parent));
                    subject.on("mousemove.selection", null).on("mouseup.selection", null);
                });
        });

        svg.on("touchstart", function () {
            var subject = d3.select(this), parent = this.parentNode,
                id = d3.event.changedTouches[0].identifier,
                start = d3.touch(parent, id), pos;
            startSelection(start);
            subject
                .on("touchmove." + id, function () {
                    if (pos = d3.touch(parent, id)) {
                        moveSelection(start, pos);
                    }
                }).on("touchend." + id, function () {
                    if (pos = d3.touch(parent, id)) {
                        endSelection(start, pos);
                        subject.on("touchmove." + id, null).on("touchend." + id, null);
                    }
                });
        });
    }

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
            .attr("x", (newWidth + 10) * count)
            .attr("y", newHeight * countY + 40)
            .attr("class", "handsOverview");
        plotHand(i, svg2, newHeight, newWidth, 'smallHand', true);
        if (count >= maxCount - 1) {
            countY += 1;
        }
        // console.log(countY);
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

function plotHand(id, svg, height, width, type, once) {
    getHands((hands) => {
        if (once) {
            svg.selectAll("path").remove();
            svg.selectAll("g").remove();
        };
        var data = hands[id];

        // set the ranges
        var x = d3.scaleLinear().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);

        // Scale the range of the data
        x.domain(d3.extent(data, (d) => { return d.x; }));
        y.domain([0, d3.max(data, (d) => { return d.y; })]);

        svg.attr("id", id);
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
            .attr("class", "line " + "id" + id)
            .attr("d", lineGenerator)
            .attr('stroke-dasharray', '2400 2400')
            .attr('stroke-dashoffset', 2400)
            .transition()
            .duration(4000)
            .attr('stroke-dashoffset', 0);
    });

}

