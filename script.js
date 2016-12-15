var svg = d3.select("svg.scatter"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    radius = 10;

d3.csv(
    './imdb-5000-movie-dataset.csv',
    function (d) {

        return d;
    }, function (error, data) {

    });
