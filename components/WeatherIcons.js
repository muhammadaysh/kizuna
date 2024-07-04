import Icon01d from "../assets/openweathermap/01d.svg";
import Icon01n from "../assets/openweathermap/01n.svg";
import Icon02d from "../assets/openweathermap/02d.svg";
import Icon02n from "../assets/openweathermap/02n.svg";
import Icon03d from "../assets/openweathermap/03d.svg";
import Icon03n from "../assets/openweathermap/03n.svg";
import Icon04d from "../assets/openweathermap/04d.svg";
import Icon04n from "../assets/openweathermap/04n.svg";
import Icon09d from "../assets/openweathermap/09d.svg";
import Icon09n from "../assets/openweathermap/09n.svg";
import Icon10d from "../assets/openweathermap/10d.svg";
import Icon10n from "../assets/openweathermap/10n.svg";
import Icon11d from "../assets/openweathermap/11d.svg";
import Icon11n from "../assets/openweathermap/11n.svg";
import Icon13d from "../assets/openweathermap/13d.svg";
import Icon13n from "../assets/openweathermap/13n.svg";
import Icon50d from "../assets/openweathermap/50d.svg";
import Icon50n from "../assets/openweathermap/50n.svg";
import React from 'react';

const iconStyle = (width, height) => ({
  width,
  height,
});

export default {
  "01d": (props) => <Icon01d style={iconStyle(props.width, props.height)} />,
  "01n": (props) => <Icon01n style={iconStyle(props.width, props.height)} />,
  "02d": (props) => <Icon02d style={iconStyle(props.width, props.height)} />,
  "02n": (props) => <Icon02n style={iconStyle(props.width, props.height)} />,
  "03d": (props) => <Icon03d style={iconStyle(props.width, props.height)} />,
  "03n": (props) => <Icon03n style={iconStyle(props.width, props.height)} />,
  "04d": (props) => <Icon04d style={iconStyle(props.width, props.height)} />,
  "04n": (props) => <Icon04n style={iconStyle(props.width, props.height)} />,
  "09d": (props) => <Icon09d style={iconStyle(props.width, props.height)} />,
  "09n": (props) => <Icon09n style={iconStyle(props.width, props.height)} />,
  "10d": (props) => <Icon10d style={iconStyle(props.width, props.height)} />,
  "10n": (props) => <Icon10n style={iconStyle(props.width, props.height)} />,
  "11d": (props) => <Icon11d style={iconStyle(props.width, props.height)} />,
  "11n": (props) => <Icon11n style={iconStyle(props.width, props.height)} />,
  "13d": (props) => <Icon13d style={iconStyle(props.width, props.height)} />,
  "13n": (props) => <Icon13n style={iconStyle(props.width, props.height)} />,
  "50d": (props) => <Icon50d style={iconStyle(props.width, props.height)} />,
  "50n": (props) => <Icon50n style={iconStyle(props.width, props.height)} />,
};