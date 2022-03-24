import React, {useState} from 'react';
import {View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {Appbar, IconButton, Text, TextInput} from 'react-native-paper';
import {useQuery} from 'react-query';
import {useAuth} from '../contexts/AuthContext';
import {getDBConnection, getMessages, insertMessage} from '../services/db';
import {SocketConnection} from '../services/socket';

export default function Chat({route, navigation}) {
  const {name, username} = route.params;
  const [text, setText] = useState('');
  const {currentUser} = useAuth();
  const messages = useQuery(['messages', username], () =>
    getDBConnection().then(db =>
      getMessages(db, currentUser?.username as string, username),
    ),
  );

  async function onSendPressed() {
    const socket = SocketConnection.getInstance();
    const db = await getDBConnection();
    const id = await insertMessage(db, {
      text,
      sender: currentUser?.username as string,
      receiver: username,
    });

    socket?.emit('send-message', {
      id,
      text,
      sendTo: username,
    });
  }

  return (
    <View>
      <Appbar.Header style={{backgroundColor: '#25D366'}}>
        <Appbar.BackAction
          color="white"
          onPress={() => {
            navigation.goBack();
          }}
        />
        <Appbar.Content title={name} titleStyle={{color: 'white'}} />
      </Appbar.Header>
      <View>
        <TextInput
          placeholder="Type a message..."
          style={{
            width: '100%',
            backgroundColor: '#fff',
            borderRadius: 10,
            padding: 10,
            paddingVertical: 0,
            margin: 10,
          }}
          value={text}
          onChangeText={setText}
        />
        <IconButton
          icon="send"
          color="#25D366"
          size={30}
          onPress={onSendPressed}
          style={{
            position: 'absolute',
            right: 10,
            bottom: 10,
          }}
        />
      </View>

      <FlatList
        data={messages.data}
        renderItem={({item}) => (
          <Text
            style={{
              backgroundColor:
                item.sender === currentUser?.username ? '#25D366' : '#fff',
              color: item.sender === currentUser?.username ? '#fff' : '#000',
              padding: 10,
              margin: 10,
              borderRadius: 10,
            }}>
            {item.text}
          </Text>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
}
