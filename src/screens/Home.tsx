import React from 'react';
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

export default function Home() {
  const {currentUser} = useAuth();
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
