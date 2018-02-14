import React, { Component } from 'react';
import {
  View,
  ViewPropTypes,
  Text,
  TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';

import XDate from 'xdate';
import dateutils from '../dateutils';
import { xdateToData, parseDate } from '../interface';
import styleConstructor from './style';
import Day from './day/basic';
import UnitDay from './day/period';
import MultiDotDay from './day/multi-dot';
import CalendarHeader from './header';
import shouldComponentUpdate from './updater';

import MonthComp from './month/basic';
import YearComp from './year/basic';

//Fallback when RN version is < 0.44
const viewPropTypes = ViewPropTypes || View.propTypes;

const EmptyArray = [];

class Calendar extends Component {
  static propTypes = {
    // Specify theme properties to override specific styles for calendar parts. Default = {}
    theme: PropTypes.object,
    // Collection of dates that have to be marked. Default = {}
    markedDates: PropTypes.object,

    // Specify style for calendar container element. Default = {}
    style: viewPropTypes.style,
    // Initially visible month. Default = Date()
    current: PropTypes.any,
    // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
    minDate: PropTypes.any,
    // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
    maxDate: PropTypes.any,

    // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
    firstDay: PropTypes.number,

    // Date marking style [simple/period]. Default = 'simple'
    markingType: PropTypes.string,

    // Hide month navigation arrows. Default = false
    hideArrows: PropTypes.bool,
    // Display loading indicador. Default = false
    displayLoadingIndicator: PropTypes.bool,
    // Do not show days of other months in month page. Default = false
    hideExtraDays: PropTypes.bool,

    // Handler which gets executed on day press. Default = undefined
    onDayPress: PropTypes.func,
    onDayLongPress: PropTypes.func,
    // Handler which gets executed when visible month changes in calendar. Default = undefined
    onMonthChange: PropTypes.func,
    onYearChange: PropTypes.func,
    onVisibleMonthsChange: PropTypes.func,
    // Replace default arrows with custom ones (direction can be 'left' or 'right')
    renderArrow: PropTypes.func,
    // Provide custom day rendering component
    dayComponent: PropTypes.any,
    // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
    monthFormat: PropTypes.string,
    // Disables changing month when click on days of other months (when hideExtraDays is false). Default = false
    disableMonthChange: PropTypes.bool,
    //  Hide day names. Default = false
    hideDayNames: PropTypes.bool,
    // Disable days by default. Default = false
    disabledByDefault: PropTypes.bool,
    // Show week numbers. Default = false
    showWeekNumbers: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.style = styleConstructor(this.props.theme);
    let currentMonth;
    let currentYear;

    if (props.current) {
      currentMonth = parseDate(props.current);
      currentYear = parseDate(props.current);
    } else {
      currentMonth = XDate();
      currentYear = XDate();
    }

    this.state = {
      currentMonth: currentMonth.getMonth(),
      currentYear: currentYear.getFullYear(),
      mode: 'day'
    };

    this.updateMonth = this.updateMonth.bind(this);
    this.updateYear = this.updateYear.bind(this);
    this.add = this.add.bind(this);
    this.pressDay = this.pressDay.bind(this);
    this.longPressDay = this.longPressDay.bind(this);
    this.pressMonth = this.pressMonth.bind(this);
    this.pressYear = this.pressYear.bind(this);
    this.onMonthHeaderPress = this.onMonthHeaderPress.bind(this);
    this.shouldComponentUpdate = shouldComponentUpdate;
  }

  componentWillReceiveProps(nextProps) {
    const { currentYear, currentMonth } = this.state;
    const current = parseDate(nextProps.current);
    let state = null;

    if (current &&
      current.toString('yyyy') !== currentYear.toString() &&
      current.toString('MM') !== (currentMonth + 1).toString()) {
      state = { ...state, currentMonth: Number(current.toString('MM')) - 1 };
    }

    if (current &&
      current.toString('yyyy') !== currentYear.toString()) {
      state = { ...state, currentYear: Number(current.toString('yyyy')) };
    }

    if (state) {
      this.setState(state);
    }
  }

  updateMonth(month, doNotTriggerListeners) {
    const { currentYear, currentMonth } = this.state;

    if (month === currentMonth) {
      return;
    }

    this.setState({
      currentMonth: month
    }, () => {
      if (!doNotTriggerListeners) {
        const currMont = XDate().setMonth(currentMonth).setFullYear(currentYear);
        if (this.props.onMonthChange) {
          this.props.onMonthChange(xdateToData(currMont));
        }
        if (this.props.onVisibleMonthsChange) {
          this.props.onVisibleMonthsChange([xdateToData(currMont)]);
        }
      }
    });
  }

  updateYear(year, doNotTriggerListeners) {
    const { currentYear } = this.state;

    if (year === currentYear) {
      return;
    }
    this.setState({
      currentYear: year
    }, () => {
      // if (!doNotTriggerListeners) {
      //   const currYear = this.state.currentYear.clone();
      //   if (this.props.onYearChange) {
      //     this.props.onYearChange(xdateToData(currYear));
      //   }
      // }
    });
  }

  pressDay(date) {
    const day = parseDate(date);
    const minDate = parseDate(this.props.minDate);
    const maxDate = parseDate(this.props.maxDate);
    if (!(minDate && !dateutils.isGTE(day, minDate)) && !(maxDate && !dateutils.isLTE(day, maxDate))) {
      const shouldUpdateMonth = this.props.disableMonthChange === undefined || !this.props.disableMonthChange;
      if (shouldUpdateMonth) {
        this.updateMonth(day.getMonth());
      }
      if (this.props.onDayPress) {
        this.props.onDayPress(xdateToData(day));
      }
    }
  }

  longPressDay(date) {
    const day = parseDate(date);
    const minDate = parseDate(this.props.minDate);
    const maxDate = parseDate(this.props.maxDate);
    if (!(minDate && !dateutils.isGTE(day, minDate)) && !(maxDate && !dateutils.isLTE(day, maxDate))) {
      const shouldUpdateMonth = this.props.disableMonthChange === undefined || !this.props.disableMonthChange;
      if (shouldUpdateMonth) {
        this.updateMonth(day.getMonth());
      }
      if (this.props.onDayLongPress) {
        this.props.onDayLongPress(xdateToData(day));
      }
    }
  }

  pressMonth(monthNum, yearNum) {
    // const date = XDate();
    this.setState({
      mode: 'day',
      currentMonth: monthNum,
      currentYear: yearNum
    });
  }

  pressYear(yearNum) {
    // const date = XDate();
    this.setState({
      mode: 'month',
      currentYear: yearNum
    });
  }

  onMonthHeaderPress() {
    const { mode } = this.state;
    let newMode = mode;
    switch (mode) {
      case 'day':
        newMode = 'month';
        break;
      case 'month':
        newMode = 'year';
        break;
    }
    this.setState({ mode: newMode });
  }

  add(count) {
    const { currentYear, currentMonth } = this.state;
    const isDayMode = this.state.mode === 'day';
    const isMonthMode = this.state.mode === 'month';
    const isYearMode = this.state.mode === 'year';

    if (isDayMode) {
      // TODO: update year if month is over 12 or less 0
      let newMonth = currentMonth + count;
      let newYear = null;
      if(newMonth >= 12){
        // go foward next year
        newMonth = 0;
        newYear = currentYear + 1;
      } else if(newMonth <= -1) {
        // backward to prev year
        newMonth = 11;
        newYear = currentYear - 1;
      }

      this.updateMonth(newMonth);

      if(newYear) {
        this.updateYear(newYear);
      }
    }
    else if (isMonthMode) {
      this.updateYear(currentYear + count);
    } else if (isYearMode) {
      this.setState({
        currentYear: currentYear + (12 * count)
      });
    }
  }

  renderDay(day, id) {
    const { currentMonth } = this.state;
    const minDate = parseDate(this.props.minDate);
    const maxDate = parseDate(this.props.maxDate);
    let state = '';
    if (this.props.disabledByDefault) {
      state = 'disabled';
    } else if ((minDate && !dateutils.isGTE(day, minDate)) || (maxDate && !dateutils.isLTE(day, maxDate))) {
      state = 'disabled';
    } else if (Number(day.toString('MM')) !== (currentMonth + 1)) {
      state = 'disabled';
    } else if (dateutils.sameDate(day, XDate())) {
      state = 'today';
    }
    let dayComp;
    if (Number(day.toString('MM')) !== (currentMonth + 1) && this.props.hideExtraDays) {
      if (this.props.markingType === 'period') {
        dayComp = (<View key={id} style={{ flex: 1 }}/>);
      } else {
        dayComp = (<View key={id} style={{ width: 32 }}/>);
      }
    } else {
      const DayComp = this.getDayComponent();
      const date = day.getDate();
      dayComp = (
        <DayComp
          key={id}
          state={state}
          theme={this.props.theme}
          onPress={this.pressDay}
          date={xdateToData(day)}
          marking={this.getDateMarking(day)}
          onLongPress={this.longPressDay}
        >
          {date}
        </DayComp>
      );
    }
    return dayComp;
  }

  getDayComponent() {
    if (this.props.dayComponent) {
      return this.props.dayComponent;
    }

    switch (this.props.markingType) {
      case 'period':
        return UnitDay;
      case 'multi-dot':
        return MultiDotDay;
      default:
        return Day;
    }
  }

  getDateMarking(day) {
    if (!this.props.markedDates) {
      return false;
    }
    const dates = this.props.markedDates[day.toString('yyyy-MM-dd')] || EmptyArray;
    if (dates.length || dates) {
      return dates;
    } else {
      return false;
    }
  }

  renderWeekNumber (weekNumber) {
    return <Day key={`week-${weekNumber}`} theme={this.props.theme} state='disabled'>{weekNumber}</Day>;
  }

  renderWeek(days, id) {
    const week = [];
    days.forEach((day, id2) => {
      week.push(this.renderDay(day, id2));
    }, this);

    if (this.props.showWeekNumbers) {
      week.unshift(this.renderWeekNumber(days[days.length - 1].getWeek()));
    }

    return (<View style={this.style.week} key={id}>{week}</View>);
  }

  renderMonth(monthList, id) {
    const { currentYear, currentMonth } = this.state;
    const months = [];

    monthList.forEach((m, idx) => {
      const _month = XDate().setMonth(m - 1);
      months.push(<MonthComp
        key={idx}
        theme={this.props.theme}
        onPress={this.pressMonth}
        month={m - 1}
        year={currentYear}
      >
        {_month.toString('MMMM')}
      </MonthComp>);
    });

    return <View style={this.style.monthRow} key={id}>{months}</View>;
  }

  renderYear(years, id) {
    const _years = [];

    years.forEach((y, idx) => {
      _years.push(<YearComp
        key={idx}
        theme={this.props.theme}
        onPress={this.pressYear}
        year={y}
      >
        {y}
      </YearComp>);
    });

    return <View style={this.style.yearRow} key={id}>{_years}</View>;
  }

  render() {
    const { mode, currentYear, currentMonth } = this.state;
    const days = dateutils.page(XDate().setDate(1).setMonth(currentMonth).setFullYear(currentYear), this.props.firstDay);
    const _months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const weeks = [];
    const months = [];
    const years = [];
    const start = -5; // year
    const end = 6; // year
    let indicator;

    if (mode === 'day') {
      while (days.length) {
        weeks.push(this.renderWeek(days.splice(0, 7), weeks.length));
      }
      const current = parseDate(this.props.current);
      if (current) {
        const lastMonthOfDay = current.clone().addMonths(1, true).setDate(1).addDays(-1).toString('yyyy-MM-dd');
        if (this.props.displayLoadingIndicator &&
          !(this.props.markedDates && this.props.markedDates[lastMonthOfDay])) {
          indicator = true;
        }
      }
    }
    else if (mode === 'month') {
      while (_months.length) {
        months.push(this.renderMonth(_months.splice(0, 3), _months.length));
      }
    }
    else if (mode === 'year') {
      const _yearList = [];
      for (i = start; i <= end; i += 1) {
        _yearList.push(currentYear + i)
      }

      while (_yearList.length) {
        years.push(this.renderYear(_yearList.splice(0, 3), _yearList.length));
      }
    }

    return (
      <View style={[this.style.container, this.props.style]}>
        <CalendarHeader
          theme={this.props.theme}
          hideArrows={this.props.hideArrows}
          month={currentMonth}
          year={currentYear}
          add={this.add}
          showIndicator={indicator}
          firstDay={this.props.firstDay}
          renderArrow={this.props.renderArrow}
          monthFormat={this.props.monthFormat}
          hideDayNames={this.props.hideDayNames}
          weekNumbers={this.props.showWeekNumbers}
          onMonthPress={this.onMonthHeaderPress}
          mode={this.state.mode}
        />
        {weeks}
        {months}
        {years}
      </View>);
  }
}

export default Calendar;
