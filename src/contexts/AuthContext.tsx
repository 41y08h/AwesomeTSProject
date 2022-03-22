import AsyncStorage from '@react-native-community/async-storage';
import React from 'react';
import {createContext, FC, useContext} from 'react';
import jwtDecode from 'jwt-decode';
import {IUser} from '../interfaces/User';
import {Text} from 'react-native';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import axios from 'axios';

interface AuthValue {
  isLoading: boolean;
  currentUser: IUser | undefined;
  isAuthenticated: boolean;
  login: UseMutationResult<
    any,
    unknown,
    {
      username: string;
      password: string;
    },
    unknown
  >;
}
const AuthContext = createContext<any>(undefined);

export const useAuth = () => useContext<AuthValue>(AuthContext);

export const AuthProvider: FC = ({children}) => {
  const queryClient = useQueryClient();
  const currentUser = useQuery('currentUser', async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      const user = jwtDecode<IUser>(token);
      return user;
    }
    return undefined;
  });
  const login = useMutation(
    async function ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) {
      const res = await axios.post('http://192.168.0.101:5000/auth/login', {
        username,
        password,
      });
      return res.data;
    },
    {
      onSuccess: async data => {
        await AsyncStorage.setItem('token', data.token);
        queryClient.setQueryData('currentUser', data.user);
      },
    },
  );

  const value = {
    isLoading: currentUser.isLoading,
    currentUser: currentUser.data,
    isAuthenticated: currentUser.isFetched && !!currentUser.data,
    login,
  };

  return (
    <AuthContext.Provider value={value}>
      {currentUser.isLoading ? <Text>Loading...</Text> : children}
    </AuthContext.Provider>
  );
};
