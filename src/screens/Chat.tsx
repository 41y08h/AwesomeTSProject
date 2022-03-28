import React, {createRef, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {Appbar, IconButton, Text, TextInput} from 'react-native-paper';
import {useQuery, useQueryClient} from 'react-query';
import {useAuth} from '../contexts/AuthContext';
import {IMessage} from '../interfaces/message';
import {getDBConnection, getMessages, insertMessage} from '../services/db';
import {SocketConnection} from '../services/socket';
import {format} from 'date-fns';

export default function Chat({route, navigation}) {
  const {name, username} = route.params;
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const {currentUser} = useAuth();
  const messages = useQuery(['messages', username], () =>
    getDBConnection().then(db =>
      getMessages(db, currentUser?.username as string, username),
    ),
  );
  const flatListRef = createRef<FlatList>();

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({
        animated: false,
      });
    }
  }, [messages.data?.length, flatListRef.current, messages.isFetching]);

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

    setText('');
    queryClient.invalidateQueries(['messages', username]);
  }

  if (messages.isLoading) return <View />;

  return (
    <View
      style={{
        flex: 1,
      }}>
      <Appbar.Header style={{backgroundColor: '#25D366'}}>
        <Appbar.BackAction
          color="white"
          onPress={() => {
            navigation.goBack();
          }}
        />
        <Appbar.Content title={name} titleStyle={{color: 'white'}} />
      </Appbar.Header>
      <View
        style={{
          flex: 1,
        }}>
        <FlatList
          ref={flatListRef}
          style={{
            flex: 1,
          }}
          data={messages.data}
          renderItem={({item}: {item: IMessage}) => (
            <View
              style={{
                backgroundColor:
                  item.sender === currentUser?.username ? '#25D366' : '#fff',
                padding: 10,
                margin: 10,
                borderRadius: 10,
                alignSelf:
                  item.sender === currentUser?.username
                    ? 'flex-end'
                    : 'flex-start',
              }}>
              <Text
                style={{
                  color:
                    item.sender === currentUser?.username ? '#fff' : '#000',
                }}>
                {item.text}
              </Text>
              <Text
                style={{
                  color:
                    item.sender === currentUser?.username ? '#fff' : '#000',
                }}>
                {format(
                  new Date(item.created_at as string),
                  'hh:mm a',
                ).toString()}
              </Text>
              {item.sender === currentUser?.username && (
                <Text>{item.delivered_at ? '✔✔' : '✔'}</Text>
              )}
            </View>
          )}
          keyExtractor={item => item.id?.toString() as string}
        />
        <View
          style={{
            height: 'auto',
            width: '100%',
            position: 'relative',
            borderWidth: 1,
            borderTopColor: '#25D366',
            borderRightWidth: 0,
            borderLeftWidth: 0,
            borderBottomWidth: 0,
          }}>
          <TextInput
            placeholder="Type a message..."
            style={{
              width: '100%',
              backgroundColor: '#fff',
              borderRadius: 10,
              paddingVertical: 0,
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
              right: 0,
              bottom: 0,
            }}
          />
        </View>
      </View>
    </View>
  );
}
