'use client';

import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import Peer from 'simple-peer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Video, Phone, PhoneOff, UserPlus } from 'lucide-react';

const VideoChat = () => {
  const [me, setMe] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState('');
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState('');

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<Peer.Instance>();
  const socketRef = useRef<Socket>();

  useEffect(() => {
    socketRef.current = io('http://localhost:3001');

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      });

    socketRef.current.on('me', (id) => {
      setMe(id);
    });

    socketRef.current.on('callUser', (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const callUser = (id: string) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream!,
    });

    peer.on('signal', (data) => {
      socketRef.current?.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });

    peer.on('stream', (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    socketRef.current?.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream!,
    });

    peer.on('signal', (data) => {
      socketRef.current?.emit('answerCall', { signal: data, to: caller });
    });

    peer.on('stream', (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* My Video */}
        <Card className="p-4 bg-gray-800 border-gray-700">
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full">
              <p className="text-sm">{name || 'Mon flux'}</p>
            </div>
          </div>
        </Card>

        {/* User Video */}
        <Card className="p-4 bg-gray-800 border-gray-700">
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            {callAccepted && !callEnded ? (
              <video
                playsInline
                ref={userVideo}
                autoPlay
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Video className="w-16 h-16 text-gray-600" />
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gray-800 border-gray-700 w-full max-w-4xl">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Input
              placeholder="Votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-700 border-gray-600"
            />
            <p className="text-sm text-gray-400">Votre ID: {me}</p>
          </div>

          <div className="flex flex-col space-y-2">
            <Input
              placeholder="ID à appeler"
              value={idToCall}
              onChange={(e) => setIdToCall(e.target.value)}
              className="bg-gray-700 border-gray-600"
            />
          </div>

          <div className="flex justify-center space-x-4">
            {callAccepted && !callEnded ? (
              <Button
                variant="destructive"
                onClick={leaveCall}
                className="flex items-center space-x-2"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Raccrocher</span>
              </Button>
            ) : (
              <Button
                onClick={() => callUser(idToCall)}
                className="flex items-center space-x-2"
                disabled={!idToCall}
              >
                <Phone className="w-4 h-4" />
                <span>Appeler</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {receivingCall && !callAccepted && (
        <Card className="p-4 bg-gray-800 border-gray-700">
          <div className="flex items-center justify-between">
            <p>{name} vous appelle...</p>
            <Button onClick={answerCall} className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Répondre</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default VideoChat;