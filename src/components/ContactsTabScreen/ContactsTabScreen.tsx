import React, {useCallback, useMemo, useRef, useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {Button} from 'react-native-paper';
import {getDBConnection, insertContact} from '../../services/db';

export default function ContactsTabScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  async function onAddContactPressed() {
    const db = await getDBConnection();
    const id = await insertContact(db, {
      name,
      username,
    });

    console.log('Inserted contact with id:', id);
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
