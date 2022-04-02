import React, {createRef, useEffect, useRef, useState} from 'react';
import {Image, PermissionsAndroid, View} from 'react-native';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {Appbar, Button, IconButton, Text, TextInput} from 'react-native-paper';
import {useQuery, useQueryClient} from 'react-query';
import {useAuth} from '../contexts/AuthContext';
import {IMessage, IMessageType} from '../interfaces/message';
import {
  getDBConnection,
  getMessages,
  insertMessage,
  updateMessageLocalImageFilename,
} from '../services/db';
import {SocketConnection} from '../services/socket';
import {format} from 'date-fns';
import {launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import AutoHeightImage from 'react-native-auto-height-image';
import axios from 'axios';
import * as ImagePicker from 'react-native-image-picker';

export default function Chat({route, navigation}) {
  const {name, username: recipient} = route.params;
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const {currentUser, token: authToken} = useAuth();
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
    // Send read receipt
    const socket = SocketConnection.getInstance();
    socket?.emit('read-receipt', {receiptFor: recipient});
  }, [messages.data?.length]);

  async function onSendPressed() {
    const socket = SocketConnection.getInstance();
    const db = await getDBConnection();
    const id = await insertMessage(db, {
      message_type: IMessageType.TEXT,
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

  async function onGallerySelectPressed() {
    const response = await launchImageLibrary({
      mediaType: 'video',
      includeBase64: true,
      selectionLimit: 1,
    });
    if (response.didCancel) return;

    const granted = await PermissionsAndroid.requestMultiple([
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_EXTERNAL_STORAGE',
    ]);
    if (
      granted['android.permission.READ_EXTERNAL_STORAGE'] != 'granted' ||
      granted['android.permission.WRITE_EXTERNAL_STORAGE'] != 'granted'
    )
      return;

    // Save asset to device
    const media = response.assets && response.assets[0];
    if (!media) return;

    const isImage = media.type?.startsWith('image');

    // Create the directory if it doesn't exist - 'ThatsApp Images' or 'ThatsApp Videos' in the external storage
    const dir = `${RNFS.ExternalStorageDirectoryPath}/ThatsApp ${
      isImage ? 'Images' : 'Videos'
    }`;
    await RNFS.mkdir(dir);

    const extension = media.type?.split('/')[1];
    const filename = `${isImage ? 'IMG' : 'VID'}_${format(
      new Date(),
      'yyyyMMdd_HHmmss',
    )}.${extension}`;
    const filepath = `${dir}/${filename}`;
    await RNFS.copyFile(media.uri as string, filepath);

    const res = await RNFS.uploadFiles({
      files: [
        {
          name: 'media',
          filename,
          filepath,
          filetype: media.type as string,
        },
      ],
      toUrl: 'http://10.0.2.2:5000/messages/upload-media',
      headers: {Authorization: `Bearer ${authToken}`},
    }).promise;

    const {url} = JSON.parse(res.body);

    // Insert in database
    const db = await getDBConnection();
    const id = await insertMessage(db, {
      text,
      sender: currentUser?.username as string,
      receiver: recipient,
      media_type: media.type,
      message_type: isImage ? IMessageType.IMAGE : IMessageType.VIDEO,
      local_media_filename: filename,
      media_size: media.base64?.length,
    });

    const socket = SocketConnection.getInstance();
    socket?.emit('send-message', {
      id,
      text,
      sendTo: recipient,
      media: {
        url,
        filename: media.fileName,
        type: media.type,
      },
    });

    setText('');
    queryClient.invalidateQueries(['messages', recipient]);
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
          renderItem={({item}: {item: IMessage}) => {
            const isImage = item.message_type === IMessageType.IMAGE;
            return (
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
                {isImage &&
                  (item.local_media_filename ? (
                    <AutoHeightImage
                      source={{
                        uri: `file://${RNFS.ExternalStorageDirectoryPath}/ThatsApp Images/${item.local_media_filename}`,
                      }}
                      width={200}
                    />
                  ) : (
                    <Button
                      onPress={async () => {
                        const extension = item.media_type?.split('/')[1];
                        const filename = `IMG_${format(
                          new Date(),
                          'yyyyMMdd_HHmmss',
                        )}.${extension}`;
                        const {promise} = RNFS.downloadFile({
                          fromUrl: item.remote_media_url as string,
                          toFile: `${RNFS.ExternalStorageDirectoryPath}/ThatsApp Images/${filename}`,
                        });
                        await promise;

                        await updateMessageLocalImageFilename(
                          item.id as number,
                          filename,
                        );

                        queryClient.invalidateQueries(['messages', recipient]);
                      }}>
                      download {Math.floor((item.media_size as number) / 1000)}{' '}
                      KB
                    </Button>
                  ))}

                {item.message_type == IMessageType.VIDEO && <Text>Video</Text>}

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
                    new Date(item.read_at as string),
                    'hh:mm a',
                  ).toString()}
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
            );
          }}
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
            onPress={onGallerySelectPressed}
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
