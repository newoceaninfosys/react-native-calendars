import React, {Component} from 'react';
import {ActivityIndicator} from 'react-native';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import XDate from 'xdate';
import PropTypes from 'prop-types';
import styleConstructor from './style';
import {weekDayNames} from '../../dateutils';

class CalendarHeader extends Component {
  static propTypes = {
    theme: PropTypes.object,
    hideArrows: PropTypes.bool,
    month: PropTypes.number,
    year: PropTypes.number,
    addMonth: PropTypes.func,
    showIndicator: PropTypes.bool,
    firstDay: PropTypes.number,
    renderArrow: PropTypes.func,
    hideDayNames: PropTypes.bool,
    weekNumbers: PropTypes.bool,
    onMonthPress: PropTypes.func,
    mode: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.style = styleConstructor(props.theme);
    this.add = this.add.bind(this);
    this.substract = this.substract.bind(this);
    this.getYearRange = this.getYearRange.bind(this);
  }

  add() {
    this.props.add(1);
  }

  substract() {
    this.props.add(-1);
  }

  getYearRange() {
    const start = -5;
    const end = 6;
    const viewYear = this.props.year;

    return (viewYear + start) + ' - ' + (viewYear + end);
  }

  shouldComponentUpdate(nextProps) {
    if (
      (nextProps.month !== this.props.month) ||
      (nextProps.year !== this.props.year) ||
      (nextProps.mode !== this.props.mode) // mode changed
    ) {
      return true;
    }
    if (nextProps.showIndicator !== this.props.showIndicator) {
      return true;
    }
    if (nextProps.hideDayNames !== this.props.hideDayNames) {
      return true;
    }
    return false;
  }

  render() {
    const isDayMode = this.props.mode === 'day';
    const isMonthMode = this.props.mode === 'month';
    const isYearMode = this.props.mode === 'year';
    let headerFormat = this.props.monthFormat ? this.props.monthFormat : 'MMMM yyyy';
    if (isMonthMode) {
      headerFormat = 'yyyy';
    }

    let leftArrow = <View/>;
    let rightArrow = <View/>;
    let weekDaysNames = weekDayNames(this.props.firstDay);
    if (!this.props.hideArrows) {
      leftArrow = (
        <TouchableOpacity
          onPress={this.substract}
          style={this.style.arrow}
        >
          {this.props.renderArrow
            ? this.props.renderArrow('left')
            : <Image
              source={require('../img/previous.png')}
              style={this.style.arrowImage}
            />}
        </TouchableOpacity>
      );
      rightArrow = (
        <TouchableOpacity onPress={this.add} style={this.style.arrow}>
          {this.props.renderArrow
            ? this.props.renderArrow('right')
            : <Image
              source={require('../img/next.png')}
              style={this.style.arrowImage}
            />}
        </TouchableOpacity>
      );
    }
    let indicator;
    if (this.props.showIndicator) {
      indicator = <ActivityIndicator/>;
    }

    return (
      <View>
        <View style={this.style.header}>
          {leftArrow}
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={this.props.onMonthPress}>
              <Text allowFontScaling={false} style={this.style.monthText}>
                {
                  isDayMode ? XDate().setDate(1).setMonth(this.props.month).setFullYear(this.props.year).toString(headerFormat) :
                    isMonthMode ? XDate().setFullYear(this.props.year).toString('yyyy') : this.getYearRange()
                }
              </Text>
            </TouchableOpacity>
            {indicator}
          </View>
          {rightArrow}
        </View>
        {
          !this.props.hideDayNames &&
          isDayMode &&
          <View style={this.style.week}>
            {this.props.weekNumbers && <Text allowFontScaling={false} style={this.style.dayHeader}></Text>}
            {weekDaysNames.map((day, idx) => (
              <Text allowFontScaling={false} key={idx} style={this.style.dayHeader} numberOfLines={1}>{day}</Text>
            ))}
          </View>
        }
      </View>
    );
  }
}

export default CalendarHeader;
