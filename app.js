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
      temp: 89,
      lat: this.originalLat,
      lon: this.originalLon,
      units: 'imperial',
      hourlyForecast: [
        { dt_txt: moment().add( 1, 'h').format(dtFmtStr), weather: [{main: 'sunny'}], main: {temp: 89} },
        { dt_txt: moment().add( 4, 'h').format(dtFmtStr), weather: [{main: 'sunny'}], main: {temp: 99} },
        { dt_txt: moment().add( 7, 'h').format(dtFmtStr), weather: [{main: 'sunny'}], main: {temp: 89} },
        { dt_txt: moment().add(10, 'h').format(dtFmtStr), weather: [{main: 'sunny'}], main: {temp: 79} },
        { dt_txt: moment().add(13, 'h').format(dtFmtStr), weather: [{main: 'sunny'}], main: {temp: 69} },
        { dt_txt: moment().add(16, 'h').format(dtFmtStr), weather: [{main: 'sunny'}], main: {temp: 59} },
        { dt_txt: moment().add(19, 'h').format(dtFmtStr), weather: [{main: 'sunny'}], main: {temp: 69} },
        { dt_txt: moment().add(22, 'h').format(dtFmtStr), weather: [{main: 'sunny'}], main: {temp: 79} },
        { dt_txt: moment().add(25, 'h').format(dtFmtStr), weather: [{main: 'sunny'}], main: {temp: 89} }
      ],
      fiveDayForecast: [
        { high: 72, low: 48, main: 'sunny'},
        { high: 72, low: 49, main: 'sunny'},
        { high: 77, low: 48, main: 'sunny'},
        { high: 78, low: 49, main: 'sunny'},
        { high: 76, low: 48, main: 'sunny'}
      ]
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
                            .then(this.weatherCallback)
            result.lat = position.coords.latitude
            result.lon = position.coords.longitude
            console.log('return value', result)

            resolve(result)
          },
          () => { // error
            resolve(
              fetchWeather(this.state.lat, this.state.lon, this.state.units)
                .then(this.weatherCallback)
            )
          }
        )
        window.setTimeout(() => {
          console.log('timeout')
          resolve(
            fetchWeather(this.state.lat, this.state.lon, this.state.units)
            .then(this.weatherCallback)
          )
        }, 8000)
      })
      promise.then((result) => {
          this.setState(result)
      })
    } else {
      console.log('no geolocation available')
    }
  },
  originalLat: 40.730610,
  originalLon: -73.935242,
  weatherCallback(results) {
    var weather = results[0].body
    var hourlyForecast = results[1].body.list

    // weather api may return an array here, so we check
    var currentWeather = Array.isArray(weather.weather) ?
                    weather.weather[0] :
                    weather.weather
    return {
      weather,
      hourlyForecast,
      temp: Math.round(weather.main.temp),
      cityName: weather.name,
      sunrise: weather.sys.sunrise,
      sunset: weather.sys.sunset,
      currentConditions: currentWeather.main,
      country: weather.sys.country
    }
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

Router.run(routes, function (Handler) {
  React.initializeTouchEvents(true)
  React.render(<Handler/>, document.getElementById('content'))
})
