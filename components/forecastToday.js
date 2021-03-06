import React from 'react'
import ForecastHourly from './forecastHourly.js'
import ForecastNow from './forecastNow.js'
import Radium from 'radium'
import { splashRed } from '../utils/weatherColor.js'

var styles = {
  base: {
    flexGrow: 1,
    overflowY: 'scroll',
    overflowX: 'hidden'
  },

  overflowDiv: {
    overflowY: 'scroll',
    overflowX: 'hidden',
    height: '55vh',
    backgroundColor: splashRed.hslaString()
  }
}

class ForecastToday extends React.Component {
  componentDidMount() {
    var todayDivHeight = document.getElementById('todayDiv').clientHeight
    var mainDividerHeight = document.getElementById('mainDivider').clientHeight
    this.setState({
      overflowHeight: todayDivHeight - mainDividerHeight - 30
    })
  }

  constructor(props) {
    super(props)
    this.state = { overflowHeight: '55vh' }
  }

  render() {
    styles.overflowDiv.height = this.state.overflowHeight
    var forecasts = this.props.forecasts
    if(forecasts && forecasts.length > 9) {
      forecasts = forecasts.slice(1, 10)
    }

    return (
      <div
        id='todayDiv'
        style={styles.base} >

        <ForecastNow
          conditionsId={ this.props.conditionsId }
          currentConditions={ this.props.currentConditions }
          humidity={ this.props.humidity }
          temp={ this.props.temp }
          units={ this.props.units } />

        <div style={styles.overflowDiv} >
          {forecasts.map((f, index) => {
            return (
              <ForecastHourly
                conditionId={f.weather[0].id}
                conditions={f.weather[0].description}
                key={index}
                temp={f.main.temp}
                time={f.dt_txt}
                units={ this.props.units }
                />
            )
          })}
        </div>
      </div>
    )
  }
}
ForecastToday.propTypes = {
  conditionsId: React.PropTypes.number,
  currentConditions: React.PropTypes.string,
  forecasts: React.PropTypes.array,
  humidity: React.PropTypes.number,
  temp: React.PropTypes.number,
  units: React.PropTypes.string
}

export default new Radium(ForecastToday)
