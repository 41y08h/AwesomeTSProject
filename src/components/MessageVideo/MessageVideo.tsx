import React, {FC, useEffect, useRef, useState} from 'react';
import Video, {OnLoadData, VideoProperties} from 'react-native-video';
import {View} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const MessageVideo: FC<VideoProperties> = props => {
  const player = useRef<Video>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [dimensions, setDimensions] = useState<{
    height: number;
    width: number;
    orientation: 'portrait' | 'landscape';
  }>();

  function onLoad(data: OnLoadData) {
    console.log(data.naturalSize);
    setDimensions(data.naturalSize);
    player.current?.seek(0);
  }

  return (
    <View
      style={{
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Video
        ref={player}
        {...props}
        paused={isPaused}
        onLoad={onLoad}
        resizeMode="contain"
        style={{
          width: 200,
          aspectRatio: dimensions && dimensions.width / dimensions.height,
        }}
      />
      <Icon
        style={{
          position: 'absolute',
        }}
        name={isPaused ? 'play' : 'pause'}
        size={30}
        color="#fff"
        onPress={() => setIsPaused(isPaused => !isPaused)}
      />
    </View>
  );
};

export default MessageVideo;
