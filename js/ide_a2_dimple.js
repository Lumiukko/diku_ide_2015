$(document).ready(function() {
    var svg = dimple.newSvg("#chartContainer", 590, 400);
    $.get("data/ankara_central.txt", function (data) {
        console.log(data);
        data = assv2json(data);
        console.log(data);
        var myChart = new dimple.chart(svg, data);
        myChart.setBounds(60, 30, 505, 305)
        var x_axis = myChart.addCategoryAxis("x", "year");
        y_axis = myChart.addMeasureAxis("y", "mean");
        y_axis.tickFormat = ',.2f';
        
        series = myChart.addSeries("AVG", dimple.plot.bar, [x_axis, y_axis]);
        series.aggregate = dimple.aggregateMethod.avg;
        myChart.assignColor("AVG", "#222222", "#000000", 0.3);
        
        myChart.addSeries("month", dimple.plot.bubble);
        
        myChart.addLegend(0, 10, 505, 40, "right");
        
        myChart.draw();
        
        y_axis.titleShape.text("Surface Temperature in Degree Celsius");
    });
});

function assv2json(data) {
    month_name = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    var json_data = [];
    var cur_year = 0; // stores the year of the current row
    $(data.split("\n")).each(function(i, d) {
        if (i < 2) return true; // we don't need the first two lines
        dv = d.split(" ");
        if (dv.length > 1) {
            data_count = 0;
            $(dv).each(function(j, value) {
                if (value == "") {
                    return true;
                }
                if (data_count == 0) {
                    cur_year = parseInt(value, 10);
                } else if (data_count < 13) {
                    value = parseFloat(value);
                    if (value < 50) { 
                        json_data.push({
                            "year": cur_year,
                            "mean": value,
                            "month": month_name[data_count-1],
                        });
                    }
                }
                data_count++;
            });
        }
    });
    return json_data;
}