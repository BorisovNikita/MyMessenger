import 'react-native-gesture-handler';
import React from 'react';
import { LogBox } from 'react-native';
// Importing our screens
import Navigator from './src/navigations/Navigator';


LogBox.ignoreLogs(['EventEmitter.removeListener'])
export default class App extends React.Component {
  render(){
    return (
      <Navigator/>
    );
  }
}