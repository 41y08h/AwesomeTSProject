import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {useAuth} from './contexts/AuthContext';
import Home from './screens/Home';
import Login from './screens/Login';
import Signup from './screens/Signup';
import {createTables, getDBConnection} from './services/db';

const Stack = createNativeStackNavigator();

export default function App() {
  const {isAuthenticated} = useAuth();

  useEffect(() => {
    getDBConnection().then(createTables);
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={Home} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
        </>
      )}
    </Stack.Navigator>
  );
}
