import React, {Component} from 'react';
import {
  TouchableOpacity,
  Text,
  View
} from 'react-native';
import PropTypes from 'prop-types';
import XDate from 'xdate';

import styleConstructor from './style';

class Year extends Component {
  static propTypes = {
    // Specify theme properties to override specific styles for calendar parts. Default = {}
    theme: PropTypes.object,
    onPress: PropTypes.func,
    year: PropTypes.number,
    date: PropTypes.object,
    onLongPress: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.style = styleConstructor(props.theme);
    this.onYearPress = this.onYearPress.bind(this);
    this.onYearLongPress = this.onYearLongPress.bind(this);
  }

  onYearPress() {
    this.props.onPress(this.props.year, this.props.year);
  }

  onYearLongPress() {
    this.props.onLongPress(this.props.year, this.props.year);
  }

  shouldComponentUpdate(nextProps) {
    const changed = ['children', 'onPress', 'onLongPress', 'year'].reduce((prev, next) => {
      if (prev) {
        return prev;
      } else if (nextProps[next] !== this.props[next]) {
        return next;
      }
      return prev;
    }, false);

    return !!changed;
  }

  render() {
    const { date } = this.props;
    const containerStyle = [this.style.base];
    const textStyle = [this.style.text];

    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={this.onYearPress}
        onLongPress={this.onYearLongPress}
      >
        <Text style={textStyle}>{String(this.props.children)}</Text>
      </TouchableOpacity>
    );
  }
}

export default Year;
