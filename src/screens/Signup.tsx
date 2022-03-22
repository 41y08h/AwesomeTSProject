import axios from 'axios';
import React, {useState} from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useMutation} from 'react-query';

export default function Signup() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const login = useMutation(async function () {
    const res = await axios.post('http://192.168.0.101:5000/auth/login', {
      username,
      password,
    });
    return res.data;
  });

  function handleSubmit() {}

  return (
    <SafeAreaView>
      <View
        style={{
          alignSelf: 'center',
          marginTop: 50,
        }}>
        <Text
          style={{
            fontSize: 30,
            color: '#25D366',
            marginBottom: 8,
          }}>
          ThatsApp
        </Text>
        <Text>Login to get started</Text>
      </View>
      <View
        style={{
          marginTop: 60,
          paddingHorizontal: 20,
        }}>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          style={{
            borderWidth: 1,
            padding: 10,
            borderRadius: 5,
            borderColor: '#dbdbdb',
            marginBottom: 10,
          }}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          style={{
            borderWidth: 1,
            padding: 10,
            borderRadius: 5,
            borderColor: '#dbdbdb',
          }}
        />
        <TouchableOpacity
          style={{
            backgroundColor: '#25D366',
            marginTop: 10,
            borderRadius: 5,
            padding: 10,
          }}
          onPress={handleSubmit}>
          <Text
            style={{
              textAlign: 'center',
              color: '#fff',
              fontWeight: 'bold',
            }}>
            Login
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
