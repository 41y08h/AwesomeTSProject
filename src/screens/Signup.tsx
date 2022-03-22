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
import {useAuth} from '../contexts/AuthContext';

export default function Signup() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const {authenticate} = useAuth();

  function handleSubmit() {
    authenticate.mutateAsync({
      type: 'register',
      username,
      password,
    });
  }

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
        <Text>Signup to get started</Text>
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
          secureTextEntry={true}
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
            Signup
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
