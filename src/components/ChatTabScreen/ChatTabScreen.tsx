import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {FlatList, Text} from 'react-native';
import {List} from 'react-native-paper';
import {useQuery} from 'react-query';
import {useAuth} from '../../contexts/AuthContext';
import {getDBConnection, getRecipients} from '../../services/db';

export default function ChatTabScreen() {
  const navigation = useNavigation();
  const {currentUser} = useAuth();
  const recipients = useQuery('recipients', () =>
    getDBConnection().then(db =>
      getRecipients(db, currentUser?.username as string),
    ),
  );

  if (recipients.isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <FlatList
      data={recipients.data}
      renderItem={({item}) => (
        <List.Item
          title={item.name}
          description={item.username}
          onPress={() => {
            navigation.navigate('Chat', {
              name: item.name,
              username: item.username,
            });
          }}
          left={props => <List.Icon {...props} icon="account" />}
        />
      )}
    />
  );
}
