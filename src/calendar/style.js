import {StyleSheet} from 'react-native';
import * as defaultStyle from '../style';

const STYLESHEET_ID = 'stylesheet.calendar.main';

export default function getStyle(theme={}) {
  const appStyle = {...defaultStyle, ...theme};
  return StyleSheet.create({
    container: {
      paddingLeft: 5,
      paddingRight: 5,
      flex: 1,
      backgroundColor: appStyle.calendarBackground
    },
    week: {
      marginTop: 7,
      marginBottom: 7,
      flexDirection: 'row',
      justifyContent: 'space-around'
    },
    month: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#cccccc'
    },
    monthRow: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    yearRow: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    ...(theme[STYLESHEET_ID] || {})
  });
}

