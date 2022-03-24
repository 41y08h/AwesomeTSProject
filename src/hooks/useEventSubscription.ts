import {useEffect} from 'react';
import {SocketConnection} from '../services/socket';

export default function useEventSubscription(
  event: string,
  listener: (data: any) => void,
) {
  useEffect(() => {
    const socket = SocketConnection.getInstance();
    socket?.on(event, listener);
    return () => {
      socket?.off(event);
    };
  }, [event, listener]);
}
