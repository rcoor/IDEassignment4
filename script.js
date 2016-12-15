// set the dimensions and margins of the graph
var margin = { top: 20, right: 20, bottom: 30, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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
        var data = d3.csvParseRows(text).map( (row) => {

            var rowItem = row.map( (value) => {
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

function scatterPCA(data) {

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data
    x.domain(d3.extent(data, (d) => { return d.x; }));
    y.domain([d3.min(data, (d) => { return d.y; }), d3.max(data, (d) => { return d.y; })]);

    // Add the scatterplot
    svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "circle")
        .attr("r", 5)
        .attr("cx", (d) => { return x(d.x); })
        .attr("cy", (d) => { return y(d.y); })
        .on("click", (d, i) => {
            plotHand(i, handSVG);
        });

}

function createHandSvg() {
    return svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
}





function plotHand(id, svg) {
    getHands((hands) => {
        svg.selectAll("*").remove();
        var data = hands[id];

        // set the ranges
        var x = d3.scaleLinear().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);


        // Scale the range of the data
        x.domain(d3.extent(data, (d) => { return d.x; }));
        y.domain([0, d3.max(data, (d) => { return d.y; })]);

        // Add the scatterplot
        svg.selectAll("dot")
            .data(data)
            .enter().append("circle")
            .attr("r", 1)
            .attr("cx", (d) => { return x(d.x); })
            .attr("cy", (d) => { return y(d.y); });

        // define the line
        var valueline = d3.line()
            .x((d) => { return x(d.x); })
            .y((d) => { return y(d.y); });

        // Add the valueline path.
        svg.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", valueline);
    });
}
