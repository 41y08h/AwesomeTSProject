import 'react-native-gesture-handler';
import React from 'react';
import {QueryClientProvider, QueryClient} from 'react-query';
import axios from 'axios';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from './screens/Login';
import Signup from './screens/Signup';
import Home from './screens/Home';
import {AuthProvider, useAuth} from './contexts/AuthContext';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      async queryFn(context) {
        const url = context.queryKey[0];

        if (typeof url !== 'string')
          throw new Error('Only strings are allowed in query keys.');

        const {data} = await axios.get(url, {
          baseURL: 'http://7abc-103-152-158-197.ngrok.io',
        });
        return data;
      },
      staleTime: 5 * 60 * 1000,
      refetchOnMount: 'always',
    },
  },
});

const Root = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <App />
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default Root;
