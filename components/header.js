import React from 'react'
import Radium from 'radium'
import { weatherColor } from '../utils/weatherColor.js'

var styles = {
  base: {
    padding: '10px 10px',
    flexShrink: '0'
  },

  cityState: {
    fontFamily: '"Comfortaa-Bold", sans-serif',
    fontSize: '1.8em',
    margin: '0'
  },

  headerDate: {
    margin: '0',
    fontSize: '1.3em'
  },

  settingsIcon: {
    float: 'right',
    fontSize: '2em'
  }
}

class Header extends React.Component {
  render() {
    styles.base.backgroundColor = weatherColor(this.props.temp)
    var cityState = this.props.cityName + ', ' + this.props.country
    if(cityState.length > 22) {
      cityState = cityState.slice(0, 22) + ' ...'
    }

    return (
      <div style={styles.base} >
        <i className="fa fa-gears"
           style={styles.settingsIcon} ></i>
        <p style={styles.cityState} >
          { cityState }
        </p>
        <p style={styles.headerDate} >tuesday, june 26</p>
      </div>
    )
  }
}
Header.propTypes = {
  cityName: React.PropTypes.string,
  country: React.PropTypes.string,
  temp: React.PropTypes.number
}

export default new Radium(Header)
