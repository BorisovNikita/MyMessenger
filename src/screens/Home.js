import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  SafeAreaView,
  TextInput,
  StyleSheet,
  Alert,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Platform,
  DeviceEventEmitter,
} from 'react-native';

const LENGTH = 6; // Length of the Room ID



const Home = ({navigation, route}) => {
  const [roomID, setRoomID] = useState('');

  const idRegexp = new RegExp(`^[a-zA-Z0-9]{${LENGTH}}$`);
  const header = 'Краткая инструкция';
  const alertHead = 'Неверный идентификатор комнаты';
  const alertRule = `Идентификатор должен состоять из ${LENGTH} символов английского алфавита (в любом регистре) и (или) арабских цифр.`;
  const rules = [
    {text: 'Для создания комнаты нажмите "СОЗДАТЬ (поле ID оставьте пустым)".', id_: 1},
    {text: 'Чтобы создать свой ID комнаты, введите его и нажмите "СОЗДАТЬ".', id_: 2},
    {text: 'Для подключения к комнате введите ID и нажмите "ВОЙТИ".', id_: 3},
    {text: 'Убедитесь в правильности ввода ID. Регистр важен!', id_: 4},
  ];

  useEffect(() => {
    DeviceEventEmitter.addListener("event.alarm", (notif) => 
    showAlert({notif: notif}));
  }, [])
  const ruleRender = (item) => {
    return (
      <View style={styles.ruleContainer} key={item.id_}>
        <Text style={styles.ruleMark}>✓</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.rules}>{item.text}</Text>
        </View>
      </View>
    );
  };

  const generateID = () => {
    var result = '';
    var characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < LENGTH; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  



  const showAlert = ({head = alertHead, notif = alertRule}) => {

    Alert.alert(
      head,
      notif + ' Сгенерировать подходящий идентификатор за Вас?',
      [
        {
          text: 'Хорошо',
          onPress: () => setRoomID(generateID),
          style: 'ok',
        },
        {
          text: 'Не нужно',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const idValidator = () => {
    return idRegexp.test(roomID);
  };

  const handleSubmit = () => {
    if (idValidator()) {
      // Enter the room
      navigation.navigate('Connecting', {
        roomID: roomID,
        isNew: false
    });
    } else {
      Alert.alert(
        alertHead,
        alertRule,
        [{ text: 'хорошо', style: 'ok' }],
        { cancelable: true }
      );
    }
  };

  const handleCreateSubmit = () => {
    // Make a new room ID
    if (roomID === '') {
      const room = generateID();
      setRoomID(room);
      // console.log(this.state.roomID); // Share this room id to another peer in order to join in the same room
      navigation.navigate('Connecting', {
        roomID: room,
        isNew: true,
      });
    } else if (idValidator()) {
      navigation.navigate('Connecting', {
        roomID: roomID,
        isNew: true,
      });
    } else {
      showAlert({});
    }
  };

  return (
      <ImageBackground
        style={styles.image}
        blurRadius={0}
        resizeMode="cover"
        source={require('../images/background.jpg')}>
        <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>{header}</Text>
          {rules.map(ruleRender)}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            value={roomID}
            maxLength={LENGTH}
            placeholder="ID комнаты"
            placeholderTextColor= '#FAFAFA'
            autoFocus={true}
            onChangeText={(text) => setRoomID(text)}
            style={styles.textInput}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>войти</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateSubmit}>
          <Text style={styles.buttonText}>создать</Text>
        </TouchableOpacity>
              </SafeAreaView>
      </ImageBackground>

  );
}

export default Home
const borderWidth = 4;
const width = '95%';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF0',
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  textInput: {
    fontSize: 20,
    borderWidth: borderWidth,
    borderRadius: 20,
    backgroundColor: '#550b1a' + 'ff',
    padding: 10,

    borderColor: '#000',
    textAlign: 'center',
    color: '#ffff',
  },

  inputContainer: {
    width: width,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#0000',
  },

  image: {
    flex: 1,
  },
  headerContainer: {
    padding: 5,
    backgroundColor: '#3e246d' + 'ff',
    width: width,
    borderRadius: 20,
    marginBottom: 30,
    borderWidth: borderWidth,
    borderColor: '#000',
  },

  header: {
    textAlign: 'center',
    color: '#FFFF',
    fontSize: 24,
    textTransform: 'uppercase',
    fontFamily: 'Roboto-Bold',
  },

  rules: {
    fontSize: 16,
    color: '#FFFF',
    fontWeight: 'normal',
    textAlign: 'justify',
    fontFamily: 'Roboto-Regular',

  },

  ruleContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  button: {
    borderWidth: borderWidth,
    borderColor: '#000f',
    alignItems: 'center',
    justifyContent: 'center',
    width: width,
    padding: 10,
    backgroundColor: '#111988' + 'ff',
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 0,
  },

  buttonText: {
    color: '#ffff',
    fontSize: 16,
    textTransform: 'uppercase',
    fontFamily: 'Roboto-Bold',
  },

  ruleMark: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#e1a3c8' + 'ff',
    marginRight: 5,
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
  },
});
