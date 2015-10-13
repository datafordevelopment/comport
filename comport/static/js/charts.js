var allRows;

function last12Months(rows){
  // offset today by 12 d3-defined months in the past
  var latestDate = d3.max(rows, function(d){ return d.date; })
  var startDate = d3.time.month.offset(latestDate, -12);
  console.log("startDate", startDate);
  return rows.filter(function(r){
    return startDate < r.date;
  });
}

var experienceBuckets = d3.scale.quantize()
  .domain([2.5, 5.5, 10.5])
  .range([
      '0-2 years',
      '3-5 years',
      '6-10 years',
      '10+ years',
      ]);

var currentYear = 2015;
var defaultNullValue = "NULL";

function translate(x, y){
  return "translate(" + x + "," + y + ")";
}

function mergeMaps(a, b){
  b.forEach(function(k, v){
    a.set(k, v);
  });
}

function nullify(value){
  if (value === defaultNullValue){
    return null;
  } else {
    return value
  }
}

var dateTimeFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
var dateTimeKey = "occuredDate";

function parseDate(dateTimeString){
  return dateTimeString ? dateTimeFormat.parse(dateTimeString) : null;
}

function parseData(rows){
  // parses dates and nulls from the raw csv
  rows.forEach(function(r){
    var dateString = nullify(r[dateTimeKey]);
    r.date = parseDate(dateString);
  });
  rows = rows.filter(function(d){
    return d.date;
  });
  return rows;
}

function drawChart(rows, config){
  // structure data for the particular chart
  var data = structureData(rows, config);

  // get the correct function for drawing this chart
  drawingFunction = drawFuncs[config.chartType];

  // if we have no chart block in the database, just make the brick
  if(config.noTemplate){
    var brick = d3.select('[role=main]')
      .append('div').attr("class", "brick");
    brick.append("h4").attr("class", "brick-title")
      .text(config.title);
    config.parent = brick.append("div").attr("class", config.parent)[0][0];
  }

  // run the function to draw the chart
  drawingFunction(config, data);
}

function addMissingYears(dataMap){
  // add missing years to the map, so we know they are empty
  var year0 = d3.min(dataMap.keys());
  var allYears = d3.range(year0, currentYear);
  allYears.forEach(function(yr){
    if( !dataMap.has(yr) ){
      dataMap.set(
        yr, {
          year: yr,
          count: 0,
          incidents: [],
      });
    }
  });
}

function structureData(parsed_rows, config){
  // restructures csv data into data than can be used to draw a chart

  // filter rows if necessary
  if( config.filter ){
    parsed_rows = config.filter(parsed_rows);
  }

  // create a grouping machine that groups by year
  var unmapped_data = d3.nest()
    .key(config.keyFunc)
    .rollup(function(leaves){
      var datum = {};
      datum[config.y] = config.yFunc(leaves);
      datum[config.x] = config.xFunc(leaves);
      datum['incidents'] = leaves;
      return datum;
    });

  // use the parsed data and the grouping machine to create a
  // simple key value store (aka "map") with years as keys
  var data = unmapped_data.map(parsed_rows, d3.map);
  console.log("mapped & filtered data", data);

  if( config.dataMapAdjust ){
    config.dataMapAdjust(data);
  }

  if( config.dontFlatten ){
    return data;
  }

  // return data structured for a chart
  var structured_data = data.values();
  if( config.sortWith ){
    var mapped = structured_data.map(function(d, i){
      return { index: i, value: config.sortWith(d) };
    });
    mapped.sort(function(a,b){
      return +(a.value > b.value) || +(a.value === b.value) - 1;
    });
    structured_data = mapped.map(function(n){
      return structured_data[n.index];
    });
  }
  console.log("structured_data", structured_data);
  return structured_data;
}

drawFuncs = {
  'lineChart': lineChart,
  'map': mapChart,
  'percent': basicPercent,
  'flagHistogram': flagHistogram,
  'mountainHistogram': mountainHistogram,
  //'matrix': matrixChart,
}
