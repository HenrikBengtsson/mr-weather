class NWSWind extends Wind {
  constructor(stationId) {
    super();
    this.stationId = stationId;

    // Make request to get JSON forecast data for stationId (actually a WFO+gridpoint)
    this.xmlhttp = new XMLHttpRequest();
    this.xmlhttp.onreadystatechange = this.onDataLoad.bind(this);
    // API documented here: https://www.weather.gov/documentation/services-web-api
    this.xmlhttp.open('GET', 'https://api.weather.gov/gridpoints/' + stationId + '/forecast/hourly', true);
    this.xmlhttp.setRequestHeader('Feature-Flags', 'forecast_wind_speed_qv');
    this.xmlhttp.send();
  }

  onDataLoad() {
    if (this.xmlhttp.readyState == 4) {
      if (this.xmlhttp.status == 200) {
        var response = JSON.parse(this.xmlhttp.responseText);
        var windDir = [];
        var windSpeed = [];
        var windGust = [];
        for (var i=0; i<response.properties.periods.length; i++) {
          var forecast = response.properties.periods[i];
          var forecastMoment = moment(forecast.startTime);

          windDir.push({x: forecastMoment, y: this.getCardinal(forecast.windDirection)});
          windSpeed.push({x: forecastMoment, y: Math.round(forecast.windSpeed.value / 1.60934)});
          windGust.push({x: forecastMoment, y: forecast.windGust ? Math.round(forecast.windGust.maxValue / 1.60934) : NaN});
        }
        this.createChart(windSpeed, windGust, windDir, true);
      } else {
        console.error("Didn't get the expected status: " + this.xmlhttp.status);
        // Display empty charts
        this.createChart([], [], []);
      }
    }
  }
}
