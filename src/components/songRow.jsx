import React from 'react';

const SongRow = ({ song, index, isPlaying, onPlay }) => {
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`flex items-center p-2 rounded-lg hover:bg-gray-800 cursor-pointer ${
        isPlaying ? 'bg-gray-800' : ''
      }`}
      onClick={() => onPlay(song)}
    >
      <div className="w-8 text-center text-gray-400">{index + 1}</div>
      <div className="flex-1 flex items-center">
        <img
          src={song.albumArt}
          alt={song.title}
          className="w-10 h-10 rounded mr-4"
        />
        <div>
          <div className="font-medium">{song.title}</div>
          <div className="text-sm text-gray-400">{song.artist}</div>
        </div>
      </div>
      <div className="text-gray-400">{formatDuration(song.duration)}</div>
    </div>
  );
};

export default SongRow;
