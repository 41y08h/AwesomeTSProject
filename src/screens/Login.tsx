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
import AsyncStorage from '@react-native-community/async-storage';
import {useAuth} from '../contexts/AuthContext';

export default function Login({navigation}) {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const {authenticate} = useAuth();

  async function handleSubmit() {
    authenticate.mutateAsync({
      type: 'login',
      username,
      password,
    });
  }

  return (
    <SafeAreaView
      style={{
        backgroundColor: '#fff',
        height: '100%',
        justifyContent: 'center',
      }}>
      <View
        style={{
          alignSelf: 'center',
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
            Login
          </Text>
        </TouchableOpacity>
        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            marginTop: 16,
          }}>
          <Text>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => {
              navigation.push('Signup');
            }}>
            <Text
              style={{
                color: '#25D366',
              }}>
              Signup
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
