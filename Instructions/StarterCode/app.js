var idSelect = d3.select("#selDataset");
var demoInfo = d3.select("#sample-metadata");
var barChart = d3.select("#bar");
var bubChart = d3.select("#bubble");
var guageChart = d3.select("#guage");

function init() {
    resetData();

    d3.json("../data/samples.json").then((data => {
        data.names.forEach((name => {
            var option = idSelect.append("option");
            option.text(name);
        }));
        var initId = idSelect.property("value")
        plotCharts(initId);
    }));

// Reset data
function resetData() {
    demoInfo.html("");
    barChart.html("");
    bubChart.html("");
    guageChart.html("");
};

// Read json & plot data
function plotCharts(id) {
    d3.json("../data/samples.json").then((data => {
        var indMeta = data.metadata.filter(participant => participant.id == id)[0];
        var wfreq = indMeta.wfreq;

        Object.entries(indMeta).forEach(([key, value]) => {
            var newList = demoInfo.append("ul");
            newList.attr("class", "list-group list-group-flush");
        
            var listItem = newList.append("li");
            listItem.attr("class", "list-group-item p-1 demo-text bg-transparent");
            listItem.text(`${key}: ${value}`);
        });
   
        var indSample = data.samples.filter(sample => sample.id == id)[0];
        var otuIds = [];
        var otuLabels = [];
        var sampleValues = [];

        Object.entries(indSample).forEach(([key, value]) => {
            switch (key) {
                case "otu_ids":
                    otuIds.push(value);
                    break;
                case "sample_values":
                    sampleValues.push(value);
                    break;
                case "otu_labels":
                    otuLabels.push(value);
                    break;
                default:
                    break;
            }
        });

        var topOtuIds = otuIds[0].slice(0, 10).reverse();
        var topOtuLabels = otuLabels[0].slice(0, 10).reverse();
        var topSampleValues = sampleValues[0].slice(0, 10).reverse();

        var topOtuFormatted = topOtuIds.map(otuId => "OTU " + otuId);

        var traceBar = {
            x: topSampleValues,
            y: topOtuFormatted,
            text: topOtuLabels,
            type: "bar",
            orientation: "h",
            marker: {
                color: "blue"
            }
        };

        var dataBar = [traceBar];

        var layoutBar = {
            height: 500,
            width: 600,
            title: {
                text: `<b>Top OTU's</b>`,
                font: {
                    size: 17,
                    color: "black"
                }
            },
            xaxis: {
                color: "black"
            },
            yaxis: {
                tickfont: { size: 12
                }
            }
        }
        Plotly.newPlot("bar", dataBar, layoutBar);

        // Bubble
        var traceBub = {
            x: otuIds[0],
            y: sampleValues[0],
            text: otuLabels[0],
            mode: 'markers',
            marker: {
                size: sampleValues[0],
                color: otuIds[0],
                colorscale: 'Earth'
            }
        };
        var dataBub = [traceBub];

        var layoutBub = {
            xaxis: {
                title: "<b>OTU ID</b>",
                color: "black"
            },
            yaxis: {
                title: "<b>Sample Values</b>",
                color: "black"
            },
            showlegend: false,
        };
        Plotly.newPlot('bubble', dataBub, layoutBub);

        // Gauge
        if (wfreq == null) {
            wfreq = 0;
        }
        var traceGauge = {
            domain: { x: [0, 1], y: [0, 1] },
            value: wfreq,
            type: "indicator",
            mode: "gauge",
            gauge: {
                axis: {
                    range: [0, 9],
                    tickmode: 'linear',
                    tickfont: {
                        size: 15
                    }
                },
                bar: { color: '#081d58' },
                steps: [
                    { range: [0, 1], color: '#eafaea' },
                    { range: [1, 2], color: '#d6f5d6' },
                    { range: [2, 3], color: '#adebad' },
                    { range: [3, 4], color: '#84e184' },
                    { range: [4, 5], color: '#5bd75b' },
                    { range: [5, 6], color: '#32cd32' },
                    { range: [6, 7], color: '#28a428' },
                    { range: [7, 8], color: '#1e7b1e' },
                    { range: [8, 9], color: '#145214' }
                ]
            }
        };
        var angle = (wfreq / 9) * 100;
        var degrees = 100 - angle,
            radius = .8;
        var radians = degrees * Math.PI / 100;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);
        var path = 'M -.0 -0.025 L .0 0.025 L ',
            cX = String(x),
            cY = String(y),
            pathEnd = ' Z';
        var path2 = path + cX + " " + cY + pathEnd;

        gaugeColors = ['#145214', '#1e7b1e', '#28a428', '#32cd32', '#5bd75b',
                '#84e184', '#adebad', '#d6f5d6', '#eafaea', 'white'];
    
        var traceNeed = {
            type: 'scatter',
            showlegend: false,
            x: [0],
            y: [0],
            marker: {
                size: 15,
                color: "red"
            },
            name: wfreq,
            hoverinfo: 'name'
        };
        var dataGauge = [traceGauge, traceNeed];
        var layoutGauge = {
            shapes: [{
                type: 'path',
                path: path2,
                fillcolor: "red",
                line: {
                    color: "red"
                }
            }],
            hoverlabel: {
                font: {
                    size: 15
                }
            },
            title: {
                text: `<b>Belly Button Washing Frequency</b><br>Scrubs Per Week`,
                font: {
                    size: 17,
                    color: "black"
                },
            },
            height: 450,
            width: 500,
            xaxis: {
                zeroline: false,
                    showticklabels: false,
                    showgrid: false,
                    range: [-1, 1],
                    fixedrange: true
            },
            yaxis: {
                zeroline: false,
                showticklabels: false,
                showgrid: false,
                range: [-0.5, 1.5],
                fixedrange: true 
            }
        };
        Plotly.newPlot('gauge', dataGauge, layoutGauge);
    }));
};

function optionChange(id) {
    resetData();
    plotCharts(id);
}
}
init();