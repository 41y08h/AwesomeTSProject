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
import {IMessage} from '../interfaces/message';
import {getDBConnection, insertMessage} from '../services/db';
import {useQueryClient} from 'react-query';

export default function Home() {
  const {token} = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    SocketConnection.initialize(token as string);
  }, []);

  useEventSubscription('connect', () => {
    console.log('connected');
  });

  useEventSubscription('message', async (message: IMessage) => {
    const {id, text, sender, receiver, created_at} = message;

    const db = await getDBConnection();
    await insertMessage(db, {id, text, sender, receiver, created_at});

    queryClient.invalidateQueries(['messages', sender]);
    console.log('message received', text);
  });

  return (
    <>
      <Appbar.Header style={{backgroundColor: '#25D366'}}>
        <Appbar.Content
          title="ThatsApp"
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
