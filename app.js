require('./styles/style.styl')

import React from 'react'
import Router from 'react-router'
import { Route, DefaultRoute, RouteHandler } from 'react-router'
import Home from './components/home.js'
import Splash from './components/splash.js'
import Settings from './components/settings.js'
import { fetchWeather } from './utils/weather.js'
import moment from 'moment'

const dtFmtStr = 'YYYY-MM-DD HH:00:00'
/*
 * we let state reside in App so async weather can be fetched on the splash
 * screen. This way when the user visits home we likely already have the info
 */
let App = React.createClass({
  getInitialState() {
    return {
      cityName: 'somewhere',
      country: 'USA',
      currentConditions: 'Clear',
      temp: 89,
      lat: NaN,
      lon: NaN,
      units: 'imperial',
      hourlyForecast: [
        { dt_txt: moment().add( 1, 'h').format(dtFmtStr), weather: [{id: 800}], main: {temp: 89} },
        { dt_txt: moment().add( 4, 'h').format(dtFmtStr), weather: [{id: 800}], main: {temp: 99} },
        { dt_txt: moment().add( 7, 'h').format(dtFmtStr), weather: [{id: 800}], main: {temp: 89} },
        { dt_txt: moment().add(10, 'h').format(dtFmtStr), weather: [{id: 800}], main: {temp: 79} },
        { dt_txt: moment().add(13, 'h').format(dtFmtStr), weather: [{id: 800}], main: {temp: 69} },
        { dt_txt: moment().add(16, 'h').format(dtFmtStr), weather: [{id: 800}], main: {temp: 59} },
        { dt_txt: moment().add(19, 'h').format(dtFmtStr), weather: [{id: 800}], main: {temp: 69} },
        { dt_txt: moment().add(22, 'h').format(dtFmtStr), weather: [{id: 800}], main: {temp: 79} },
        { dt_txt: moment().add(25, 'h').format(dtFmtStr), weather: [{id: 800}], main: {temp: 89} }
      ],
      fiveDayForecast: [
        { dt: parseInt(moment().add( 0, 'd').format('X')), temp: { max: 92, min: 65 }, weather: [{id: 800}]},
        { dt: parseInt(moment().add( 1, 'd').format('X')), temp: { max: 83, min: 65 }, weather: [{id: 801}]},
        { dt: parseInt(moment().add( 2, 'd').format('X')), temp: { max: 92, min: 69 }, weather: [{id: 802}]},
        { dt: parseInt(moment().add( 3, 'd').format('X')), temp: { max: 89, min: 70 }, weather: [{id: 803}]},
        { dt: parseInt(moment().add( 4, 'd').format('X')), temp: { max: 89, min: 65 }, weather: [{id: 804}]}
      ],
      weather: {
        weather: [
          { id: 800 }
        ]
      }
    }
  },
  componentDidMount() {
    if(navigator.geolocation) {
      var promise = new Promise((resolve) => {
        console.log('browser supports geolocation, waiting for user')
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('browser gps given', position)
            var result = fetchWeather(position.coords.latitude,
                                      position.coords.longitude,
                                      this.state.units)
                            .then(this.weatherCallback, this.fetchWeatherError)
            result.lat = position.coords.latitude
            result.lon = position.coords.longitude
            console.log('return value', result)

            resolve(result)
          },
          () => { // error
            console.log('geolocation error branch, fetch weather anyway')
            resolve(
              fetchWeather(this.state.lat, this.state.lon, this.state.units)
                .then(this.weatherCallback, this.fetchWeatherError)
            )
          }
        )
        // window.setTimeout(() => {
        //   console.log('timeout')
        //   resolve(
        //     fetchWeather(this.state.lat, this.state.lon, this.state.units)
        //     .then(this.weatherCallback, this.fetchWeatherError)
        //   )
        // }, 8000)
      })
      promise.then((result) => {
        this.setState(result)
      })
    } else {
      console.log('no geolocation available')
    }
  },
  weatherCallback(results) {
    var weather = results[0].body
    var hourlyForecast = results[1].body.list
    var fiveDayForecast = results[2].body.list

    // weather api may return an array here, so we check
    var currentWeather = Array.isArray(weather.weather) ?
                    weather.weather[0] :
                    weather.weather
    return {
      weather,
      hourlyForecast,
      fiveDayForecast,
      temp: Math.round(weather.main.temp),
      cityName: weather.name,
      sunrise: weather.sys.sunrise,
      sunset: weather.sys.sunset,
      currentConditions: currentWeather.main,
      country: weather.sys.country
    }
  },
  fetchWeatherError(reason) {
    console.log(reason)
  },
  saveSettings: function(newState) {
    this.setState(newState)
  },
  render() {
    return (
      <RouteHandler
        state = { this.state }
        syncFunc={ this.saveSettings } />
    )
  }
})

let routes = (
  <Route handler={App} path="/">
    <DefaultRoute handler={Splash} />
    <Route handler={Home}
           name="home"
           path="/home" />
    <Route handler={Settings}
           name="settings"
           path="/settings" />
  </Route>
)

function startApp() {
  Router.run(routes, function (Handler) {
    React.initializeTouchEvents(true)
    React.render(<Handler/>, document.getElementById('content'))
  })
}

if (window.cordova) {
  console.log('wait for deviceready')
  document.addEventListener('deviceready', startApp, false);
} else {
  // browser, start asap
  startApp();
}
