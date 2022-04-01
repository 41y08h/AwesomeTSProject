import React, {useEffect} from 'react';
import {SafeAreaView, Text} from 'react-native';
import {Appbar} from 'react-native-paper';
import {useAuth} from '../contexts/AuthContext';
import {
  Tabs,
  TabScreen,
  useTabIndex,
  useTabNavigation,
} from 'react-native-paper-tabs';
import ChatTabScreen from '../components/ChatTabScreen';
import ContactsTabScreen from '../components/ContactsTabScreen';
import useEventSubscription from '../hooks/useEventSubscription';
import {SocketConnection} from '../services/socket';
import {IMessage, IMessageType} from '../interfaces/message';
import {
  getDBConnection,
  insertMessage,
  updateMessageDeliveryTime,
  updateMessageReadTime,
} from '../services/db';
import {useQueryClient} from 'react-query';

export default function Home() {
  const {token, currentUser} = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    SocketConnection.initialize(token as string);
  }, []);

  useEventSubscription('connect', () => {
    console.log('connected');
  });

  useEventSubscription('message', async message => {
    const {id, text, media, message_type, sender, receiver, created_at} =
      message;

    const db = await getDBConnection();
    await insertMessage(db, {
      id,
      text,
      sender,
      message_type,
      receiver,
      created_at,
      media_type: media?.type,
      remote_media_url: media?.url,
      media_size: media?.size,
    });

    queryClient.invalidateQueries(['messages', sender]);
    queryClient.invalidateQueries('recipients');
    console.log('message received', text);
    const socket = SocketConnection.getInstance();

    socket?.emit('delivery-receipt', {receiptFor: sender, messageId: id});
  });

  useEventSubscription('delivery-receipt', async ({receiptFrom, messageId}) => {
    await updateMessageDeliveryTime(messageId, receiptFrom);
    queryClient.invalidateQueries(['messages', receiptFrom]);
  });

  useEventSubscription(
    'read-receipt',
    async ({receiptFrom}: {receiptFrom: string}) => {
      await updateMessageReadTime(receiptFrom);
      queryClient.invalidateQueries(['messages', receiptFrom]);
    },
  );

  return (
    <>
      <Appbar.Header style={{backgroundColor: '#25D366'}}>
        <Appbar.Content
          title={'ThatsApp ' + currentUser?.username}
          titleStyle={{
            color: '#fff',
          }}
        />
      </Appbar.Header>
      <Tabs style={{backgroundColor: '#25D366'}}>
        <TabScreen label="Chat" icon="message">
          <ChatTabScreen />
        </TabScreen>
        <TabScreen label="Contacts" icon="contacts">
          <ContactsTabScreen />
        </TabScreen>
      </Tabs>
    </>
  );
}
