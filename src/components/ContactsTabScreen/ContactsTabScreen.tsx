import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {Button, List} from 'react-native-paper';
import {useQuery, useQueryClient} from 'react-query';
import {getContacts, getDBConnection, insertContact} from '../../services/db';

export default function ContactsTabScreen() {
  const navigation = useNavigation();
  const contacts = useQuery('contacts', () =>
    getDBConnection().then(getContacts),
  );
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  async function onAddContactPressed() {
    const db = await getDBConnection();
    const id = await insertContact(db, {
      name,
      username,
    });

    console.log('Inserted contact with id:', id);
    queryClient.invalidateQueries('contacts');
  }

  function renderContacts() {
    if (contacts.isLoading) {
      return <Text>Loading...</Text>;
    }

    if (contacts.isError) {
      return <Text>Error: (</Text>;
    }

    return (
      <FlatList
        data={contacts.data}
        renderItem={({item}) => (
          <List.Item
            title={item.name}
            description={item.username}
            onPress={() => {
              navigation.navigate('Chat', {
                username: item.username,
                name: item.name,
              });
            }}
            left={props => <List.Icon {...props} icon="account" />}
          />
        )}
      />
    );
  }

  return (
    <View
      style={{
        height: '100%',
      }}>
      <TextInput
        placeholder="Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />
      <Button onPress={onAddContactPressed}>Add Contact</Button>
      {renderContacts()}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    margin: 8,
    padding: 8,
    borderColor: '#dbdbdb',
    borderWidth: 1,
  },
});
