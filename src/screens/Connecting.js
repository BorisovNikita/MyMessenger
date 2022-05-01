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
    DeviceEventEmitter,
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
  import {
      RTCPeerConnection,
      RTCSessionDescription,
      RTCIceCandidate
} from 'react-native-webrtc'
import io from "socket.io-client";


import WaitingFor from '../screens/WaitingFor';
import ConnectToServer from '../screens/ConnectToServer';
import Chat from '../screens/Chat';


const Connecting = ({ navigation, route }) => {
    const socketRef = useRef();
    const peerRef = useRef();
    const otherUser = useRef();
    const sendChannel = useRef(); // Data channel
    const { roomID } = route.params;
    const [isConnectToServer, updateIsConToServer] = useState(false)
    const [isPeerConnected, updateIsPeerCon] = useState(false)
    const [messages, setMessages] = useState([]);
    const startMessaging = useRef(false)
    const keysRef = useRef()

    useEffect(() => {
        // Step 1: Connect with the Signal server
        socketRef.current = io.connect("https://simplemessendgerserver.herokuapp.com/");
        // socketRef.current = io.connect("http://192.168.1.38:9000")
        socketRef.current.on('connect', () => {
            updateIsConToServer(true)
            if (route.params.isNew) {
              socketRef.current.emit("create room", roomID);
            } else {
              socketRef.current.emit("join room", roomID); // Room ID
            }
        });
        socketRef.current.on('disconnect', () => {
            updateIsConToServer(false)
        });

        // Step 2: Join the room. If initiator we will create a new room otherwise we will join a room
        if (route.params.isNew) {
             // Room ID
            socketRef.current.on("create error", (error) => {
              DeviceEventEmitter.emit("event.alarm", error);  
              navigation.goBack()
            })
            socketRef.current.on("create seccessfull", () => {})

        } else {
            socketRef.current.on("join error", (error) => {
                DeviceEventEmitter.emit("event.alarm", error);
                navigation.goBack()
            })
            socketRef.current.on("join successfull", () => {})
        }
        
        socketRef.current.on("user disconnected", () => {
          navigation.goBack()

      })

        // Step 3: Waiting for the other peer to join the room
        socketRef.current.on("other user", userID => {
            callUser(userID);
            otherUser.current = userID;
         

        });

        // Signals that both peers have joined the room
        socketRef.current.on("user joined", userID => {
            otherUser.current = userID;
        });

        socketRef.current.on("offer", handleOffer);

        socketRef.current.on("answer", handleAnswer);

        socketRef.current.on("ice-candidate", handleNewICECandidateMsg);

        return () => {
          socketRef.current.close()
          DeviceEventEmitter.removeAllListeners("event.mapMarkerSelected")

        }
    }, []);

    function keyGenerator( p = null, g = null){
      p = p ? p : parseInt(Math.random() * 100);
      g = g ? g : parseInt(Math.random() * 100);
      const a = parseInt(Math.random() * 10);
      const A = (Math.pow(g, a) % p)
      keysRef.current = {p: p, g: g, a: a, A: A, B: null, s: null}
      return keysRef.current
    }

    function callUser(userID){
        // This will initiate the call for the receiving peer
        console.log("[INFO] Initiated a call")
        peerRef.current = Peer(userID);
        
        sendChannel.current = peerRef.current.createDataChannel("sendChannel");
        
        // listen to incoming messages from other peer
        sendChannel.current.onmessage = handleReceiveMessage;
      }

    function Peer(userID) {
        /* 
           Here we are using Turn and Stun server
           (ref: https://blog.ivrpowers.com/post/technologies/what-is-stun-turn-server/)
        */
        const peer = new RTCPeerConnection({
          iceServers: [
              {
                  urls: "stun:stun.stunprotocol.org"
              },
              {
                  urls: 'turn:numb.viagenie.ca',
                  credential: 'muazkh',
                  username: 'webrtc@live.com'
              },
             ]
          });
        peer.onicecandidate = handleICECandidateEvent;
        peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);
        return peer;
      }

      function handleNegotiationNeededEvent(userID){
        console.log('[Negotiation Neded EVENT]')
        // Offer made by the initiating peer to the receiving peer.
        peerRef.current.createOffer().then(offer => {
           return peerRef.current.setLocalDescription(offer);
        })
        .then(() => {
          const payload = {
            target: userID,
            caller: socketRef.current.id,
            sdp: peerRef.current.localDescription,
          };
          socketRef.current.emit("offer", payload);
        })
        .catch(err => console.log("Error handling negotiation needed event", err));
      }

      function handleOffer(incoming) {
        /*
          Here we are exchanging config information
          between the peers to establish communication
        */
        console.log("[INFO] Handling Offer")
        peerRef.current = Peer();
        peerRef.current.ondatachannel = (event) => {
          sendChannel.current = event.channel;
          sendChannel.current.onmessage = handleReceiveMessage;
          console.log('[SUCCESS] Connection established')
          keysPart = keyGenerator()
          const sendString = keysPart['p'] + "$" + keysPart['g'] + "$" + keysPart['A']
          sendChannel.current.send(sendString);
        }
    
        /*
          Session Description: It is the config information of the peer
          SDP stands for Session Description Protocol. The exchange
          of config information between the peers happens using this protocol
        */
        const desc = new RTCSessionDescription(incoming.sdp);
    
        /* 
           Remote Description : Information about the other peer
           Local Description: Information about you 'current peer'
        */
    
        peerRef.current.setRemoteDescription(desc).then(() => {
        }).then(() => {
          return peerRef.current.createAnswer();
        }).then(answer => {
          return peerRef.current.setLocalDescription(answer);
        }).then(() => {
          const payload = {
            target: incoming.caller,
            caller: socketRef.current.id,
            sdp: peerRef.current.localDescription
          }
          socketRef.current.emit("answer", payload);
        })


        
      }

      function handleAnswer(message){
        // Handle answer by the receiving peer
        const desc = new RTCSessionDescription(message.sdp);
        peerRef.current.setRemoteDescription(desc).catch(e => console.log("Error handle answer", e));
        console.log('[Handle Answer]')
      }

      function handleReceiveMessage(e){
        // Listener for receiving messages from the peer
        console.log("[INFO] Message received from peer: ", e.data);
        
        if (startMessaging.current) {
          const msg = [{
            _id: Math.random(1000).toString(),
            text: encode(e.data.slice(1,-1), keysRef.current),
            // text: e.data,
            createdAt: new Date(),
            user: {
              _id: 2,
            },
          }];
          setMessages(previousMessages => GiftedChat.append(previousMessages, msg))

        } else {
          const keysPart = e.data.split('$').map(key => parseInt(key))
          if (keysPart.length === 1) {
            const B = keysPart[0]
            const s = Math.pow(B, keysRef.current['a']) % keysRef.current['p']
            keysRef.current = {...keysRef.current,  B: B, s: s}
            
          } else {
            const p = keysPart[0]
            const g = keysPart[1]
            const B = keysPart[2]
            const a = parseInt(Math.random() * 10);
            const A = Math.pow(g, a) % p
            const s = Math.pow(B, a) % p
            keysRef.current = {p: p, g: g, a: a, A: A, B: B, s: s}
            sendChannel.current.send(String(A))
          }

          updateIsPeerCon(true)
          startMessaging.current = true
        }
        
      };

      function handleICECandidateEvent(e) {
        console.log('[ICE CANDIDATE]')
        /*
          ICE stands for Interactive Connectivity Establishment. Using this
          peers exchange information over the intenet. When establishing a
          connection between the peers, peers generally look for several 
          ICE candidates and then decide which to choose best among possible
          candidates
        */
        if (e.candidate) {
            const payload = {
                target: otherUser.current,
                candidate: e.candidate,
            }
            socketRef.current.emit("ice-candidate", payload);
        }
    }
    
    function handleNewICECandidateMsg(incoming) {
      const candidate = new RTCIceCandidate(incoming);
    
      peerRef.current.addIceCandidate(candidate)
          .catch(e => console.log(e));
    } 


    function encode(text, key1) {
      const key = String(key1)
      var output = ''
      for (var i = 0; i < text.length; i++) {
        const inp = text.charCodeAt(i);
        const k = key.charCodeAt(i % key.length);
        output += String.fromCharCode(inp ^ k); 
      }
      return output
    }

    function sendMessage(messages = []){
        
        // sendChannel.current.send(messages[0].text);
        sendChannel.current.send("+" + encode(messages[0].text, keysRef.current) + "+");
        // sendChannel.current.send(JSON.stringify(keysRef.current));
        // setMessages(previousMessages => GiftedChat.append(previousMessages))
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
      }

    return (
        isConnectToServer ? (isPeerConnected ? <Chat
        navigation={navigation}
        route={route}
        messages={messages}
        onSend={sendMessage}
        /> : <WaitingFor navigation={navigation} route={route} />) :
        <ConnectToServer navigation={navigation} route={route} />
    )
}

export default Connecting