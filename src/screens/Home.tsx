import React from 'react';
import {SafeAreaView, Text} from 'react-native';
import {useAuth} from '../contexts/AuthContext';

export default function Home() {
  const {currentUser} = useAuth();
  return (
    <SafeAreaView>
      <Text
        style={{
          alignSelf: 'center',
        }}>
        {currentUser ? `Welcome ${currentUser.username}` : 'Please login'}
      </Text>
    </SafeAreaView>
  );
}
