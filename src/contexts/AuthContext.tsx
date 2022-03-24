import AsyncStorage from '@react-native-community/async-storage';
import React from 'react';
import {createContext, FC, useContext} from 'react';
import jwtDecode from 'jwt-decode';
import {IUser} from '../interfaces/User';
import {Text} from 'react-native';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationResult,
} from 'react-query';
import axios from 'axios';

interface AuthValue {
  isLoading: boolean;
  token: string | undefined;
  currentUser: IUser | undefined;
  isAuthenticated: boolean;
  authenticate: UseMutationResult<
    any,
    unknown,
    {
      type: 'login' | 'register';
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
  const auth = useQuery('auth', async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      const user = jwtDecode<IUser>(token);
      return {user, token};
    }
    return undefined;
  });
  const authenticate = useMutation(
    async function ({
      type,
      username,
      password,
    }: {
      type: 'login' | 'register';
      username: string;
      password: string;
    }) {
      const res = await axios.post(`http://127.0.0.1:5000/auth/${type}`, {
        username,
        password,
      });
      console.log('OK');

      return res.data;
    },
    {
      onSuccess: async data => {
        await AsyncStorage.setItem('token', data.token);
        queryClient.setQueryData('auth', {
          token: data.token,
          user: data.user,
        });
      },
    },
  );

  const value = {
    isLoading: auth.isLoading,
    token: auth.data?.token,
    currentUser: auth.data?.user,
    isAuthenticated: auth.isFetched && auth.data?.user !== undefined,
    authenticate,
  };

  return (
    <AuthContext.Provider value={value}>
      {auth.isLoading ? <Text>Loading...</Text> : children}
    </AuthContext.Provider>
  );
};
