import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Platform,
  StatusBar,
} from 'react-native';

const ConnectToServer = ({navigation, route}) => {
  const [dots, dotsUpdate] = useState(2)

  useEffect(() => {
    const myTimer = setInterval(
      () => dotsUpdate((dots) => (dots + 1) % 3),
      1000
    )

    return () => { clearInterval(myTimer) }
  }, [])
  

  return (
    <ImageBackground
      blurRadius={1}
      style={styles.image}
      resizeMode="cover"
      source={require('../images/background.jpg')}>
      <SafeAreaView style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.waitingText}>
            Подключение к серверу {'.'.repeat(dots + 1)}
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
  
}

export default ConnectToServer

const styles = StyleSheet.create({
  image: {
    flex: 1,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF0',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  waitingText: {
    width: '100%',
    fontSize: 30,
    textAlign: 'center',
    borderRadius: 30,
    borderWidth: 4,
    paddingHorizontal: 20,
    paddingVertical: 7,
    textTransform: 'lowercase',
    color: '#ffff',
    borderColor: '#000f',
    backgroundColor: '#600719' + 'ff',
    fontFamily: 'Roboto-Bold',
  },
});
