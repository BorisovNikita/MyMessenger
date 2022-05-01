import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import {
  GiftedChat,
  InputToolbar,
  Composer,
  Send,
  Day,
  Message,
  Bubble,
  Time,
  MessageText,
} from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/Ionicons';

require('dayjs/locale/ru');

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = { messages: [] };
  }

  forExample = function () {
    const msg = [
      {
        _id: Math.random(1000).toString(),
        text: 'example',
        createdAt: new Date(),
        user: {
          _id: 2,
        },
      },
    ];
    this.setState((state, props) => ({
      messages: GiftedChat.append(state.messages, msg),
    }));
  };
  sendMessage = function (messages = []) {
    this.setState((state, props) => ({
      messages: GiftedChat.append(state.messages, messages),
    }));
    this.forExample();
  };
  customtInputToolbar = function (props) {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbarContainerStyle}
        primaryStyle={styles.inputToolbarPrimaryStyle}
      />
    );
  };
  customComposer = function (props) {
    return (
      <Composer
        {...props}
        placeholder="Сообщение"
        placeholderTextColor="#c7f6ff"
      />
    );
  };
  customSend = function (props) {
    return (
      <Send {...props} containerStyle={styles.sendContainerStyle}>
        <Icon name="send" size={25} color="#1da7d8" />
      </Send>
    );
  };
  customDay = function (props) {
    return (
      <Day
        {...props}
        wrapperStyle={styles.dayWrapperStyle}
        textStyle={styles.dayTextStyle}
      />
    );
  };
  customBubble = function (props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#23144f' + 'ff',
            borderWidth: 2,
            maxWidth: '95%',
          },
          right: {
            backgroundColor: '#440a3c' + 'ff',
            borderWidth: 2,
            maxWidth: '95%',
          },
        }}
        textStyle={{
          left: { color: '#ffff' },
          right: { color: '#ffff' },
        }}
      />
    );
  };
  customTime = function (props) {
    return (
      <Time
        {...props}
        timeTextStyle={{
          left: { color: '#b4b4b4' },
          right: { color: '#b4b4b4' },
        }}
      />
    );
  };
  
  render() {
    return (
      <ImageBackground
        blurRadius={1}
        style={styles.image}
        resizeMode="cover"
        source={require('../images/background.jpg')}>
        <SafeAreaView style={styles.container}>
          <GiftedChat
            messages={this.props.messages}

            renderAvatar={null}
            locale={'ru'}
            timeFormat="HH:mm:ss"
            dateFormat="DD MMMM YYYY"
            onSend={(message) => this.props.onSend(message)}
            renderInputToolbar={(props) => this.customtInputToolbar(props)}
            renderComposer={(props) => this.customComposer(props)}
            renderSend={(props) => this.customSend(props)}
            renderDay={(props) => this.customDay(props)}
            renderBubble={(props) => this.customBubble(props)}
            renderTime={(props) => this.customTime(props)}
            textInputStyle={styles.composerTextInputStyle}
            user={{ _id: 1 }}
          />
        </SafeAreaView>
      </ImageBackground>
    );
  }
}
const styles = StyleSheet.create({
  image: {
    flex: 1,
    backgroundColor: '#000f',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF0',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  inputToolbarContainerStyle: {
    borderTopColor: '#000f',
    borderTopWidth: 2,
  },

  inputToolbarPrimaryStyle: {
    backgroundColor: '#131953' + 'ff',
  },
  composerTextInputStyle: {
    color: '#ffff',
    width: '90%',
  },
  sendContainerStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  dayWrapperStyle: {
    backgroundColor: '#131953' + 'ff',
    fontWeight: 'normal',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 2,
  },
  dayTextStyle: {
    color: '#ffffff' + 'ff',
  },
});