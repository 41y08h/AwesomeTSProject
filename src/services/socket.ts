import io, {Socket} from 'socket.io-client';

export const SocketConnection = (function () {
  let instance: Socket | undefined;

  return {
    getInstance: function () {
      return instance;
    },
    initialize: function (token: string) {
      instance = io('http://10.0.2.2:5000', {auth: {token}});
    },
  };
})();
