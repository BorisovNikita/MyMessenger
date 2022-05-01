import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';

const WaitingFor = ({navigation, route}) => {
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
        <Text
          style={styles.roomID}
          onPress={() => {
            Clipboard.setString(route.params.roomID);
            Alert.alert('ID скопирован', route.params.roomID, [{
        text: 'Хорошо',
        style: 'ok',
      },], { cancelable: true });
          }}>
          {'ID вашей комнаты:\n'}
          {route.params.roomID}
        </Text>
        <View style={styles.textContainer}>
          <Text style={styles.waitingText}>
            Ожидание подключения собеседника {'.'.repeat(dots + 1)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={navigation.goBack}>
          <Text style={styles.buttonText}>назад</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
  
}

export default WaitingFor

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
  roomID: {
    fontFamily: 'Roboto-Bold',
    fontSize: 22,
    textAlign: 'center',
    borderRadius: 30,
    borderWidth: 4,
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderColor: '#000f',
    backgroundColor: '#600719',
    color: '#ffff',
    marginTop: 20,
    maxWidth: '90%',
  },
  waitingText: {
    width: '100%',
    fontSize: 30,
    textAlign: 'center',
    borderRadius: 30,
    borderWidth: 4,
    paddingHorizontal: 20,
    paddingBottom: 7,
    textTransform: 'lowercase',
    color: '#ffff',
    borderColor: '#000f',
    backgroundColor: '#600719' + 'ff',
    fontFamily: 'Roboto-Bold',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    marginBottom: 20,
  },
  buttonText: {
    textAlign: 'center',
    borderWidth: 4,
    width: '100%',
    borderColor: '#000f',
    color: '#ffff',
    padding: 10,
    backgroundColor: '#111988' + 'ff',
    borderRadius: 20,
    fontSize: 24,
    fontFamily: 'Roboto-Bold',
  },
});
