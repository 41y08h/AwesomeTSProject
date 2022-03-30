import React, {createRef, useEffect, useRef, useState} from 'react';
import {PermissionsAndroid, View} from 'react-native';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {Appbar, IconButton, Text, TextInput} from 'react-native-paper';
import {useQuery, useQueryClient} from 'react-query';
import {useAuth} from '../contexts/AuthContext';
import {IMessage} from '../interfaces/message';
import {getDBConnection, getMessages, insertMessage} from '../services/db';
import {SocketConnection} from '../services/socket';
import {format} from 'date-fns';
import {launchImageLibrary} from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';

export default function Chat({route, navigation}) {
  const {name, username: recipient} = route.params;
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const {currentUser} = useAuth();
  const messages = useQuery(['messages', recipient], () =>
    getDBConnection().then(db =>
      getMessages(db, currentUser?.username as string, recipient),
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

  useEffect(() => {
    console.log('changed');
    // Send read receipt
    const socket = SocketConnection.getInstance();
    socket?.emit('read-receipt', {receiptFor: recipient});
  }, [messages.data?.length]);

  async function onSendPressed() {
    const socket = SocketConnection.getInstance();
    const db = await getDBConnection();
    const id = await insertMessage(db, {
      text,
      sender: currentUser?.username as string,
      receiver: recipient,
    });

    socket?.emit('send-message', {
      id,
      text,
      sendTo: recipient,
    });

    setText('');
    queryClient.invalidateQueries(['messages', recipient]);
  }

  async function onImageSelectPressed() {
    const response = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
    });
    if (response.didCancel) return;

    // const image = response.assets && response.assets[0];
    // const socket = SocketConnection.getInstance();
    // socket?.emit('image', {
    //   text,
    //   sendTo: recipient,
    //   image: {
    //     base64: image?.base64,
    //     filename: image?.fileName,
    //     type: image?.type,
    //   },
    // });

    const granted = await PermissionsAndroid.requestMultiple([
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_EXTERNAL_STORAGE',
    ]);
    if (
      granted['android.permission.READ_EXTERNAL_STORAGE'] != 'granted' ||
      granted['android.permission.WRITE_EXTERNAL_STORAGE'] != 'granted'
    )
      return;

    const path = '/storage/emulated/0/test.txt';

    await RNFS.writeFile(path, 'Hello World!', 'utf8');
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
                {format(new Date(item.read_at as string), 'hh:mm a').toString()}
              </Text>
              {item.sender === currentUser?.username && (
                <Text
                  style={{
                    color: item.read_at ? '#fff' : '#000',
                  }}>
                  {item.delivered_at ? '✔✔' : '✔'}
                </Text>
              )}
            </View>
          )}
          keyExtractor={item => item.id?.toString() as string}
        />
        <View
          style={{
            height: 'auto',
            width: '100%',
            borderWidth: 1,
            borderTopColor: '#25D366',
            borderRightWidth: 0,
            borderLeftWidth: 0,
            borderBottomWidth: 0,
            justifyContent: 'space-between',
            flexDirection: 'row',
          }}>
          <IconButton
            icon="image"
            color="#25D366"
            size={30}
            onPress={onImageSelectPressed}
          />
          <TextInput
            placeholder="Type a message..."
            style={{
              flexGrow: 1,
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
          />
        </View>
      </View>
    </View>
  );
}
