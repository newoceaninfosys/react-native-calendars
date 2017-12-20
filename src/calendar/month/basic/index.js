import React, {Component} from 'react';
import {
  TouchableOpacity,
  Text,
  View
} from 'react-native';
import PropTypes from 'prop-types';
import XDate from 'xdate';

import styleConstructor from './style';

class Month extends Component {
  static propTypes = {
    // Specify theme properties to override specific styles for calendar parts. Default = {}
    theme: PropTypes.object,
    onPress: PropTypes.func,
    month: PropTypes.number,
    year: PropTypes.number,
    date: PropTypes.object,
    onLongPress: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.style = styleConstructor(props.theme);
    this.onMonthPress = this.onMonthPress.bind(this);
    this.onMonthLongPress = this.onMonthLongPress.bind(this);
  }

  onMonthPress() {
    this.props.onPress(this.props.month, this.props.year);
  }

  onMonthLongPress() {
    this.props.onLongPress(this.props.month, this.props.year);
  }

  shouldComponentUpdate(nextProps) {
    const changed = ['children', 'onPress', 'onLongPress', 'month', 'year'].reduce((prev, next) => {
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
    const isCurrent = date && Number(date.toString('MM')) === (this.props.month + 1);

    if (isCurrent) {
      containerStyle.push(this.style.selected);
      textStyle.push(this.style.selectedText);
    }

    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={this.onMonthPress}
        onLongPress={this.onMonthLongPress}
      >
        <Text style={textStyle}>{String(this.props.children)}</Text>
      </TouchableOpacity>
    );
  }
}

export default Month;
