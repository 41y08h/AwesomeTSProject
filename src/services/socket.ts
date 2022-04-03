import io, {Socket} from 'socket.io-client';

export const SocketConnection = (function () {
  let instance: Socket | undefined;

  return {
    getInstance: function () {
      return instance;
    },
    initialize: function (token: string) {
      instance = io('http://7abc-103-152-158-197.ngrok.io', {auth: {token}});
    },
  };
})();
