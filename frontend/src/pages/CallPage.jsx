import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import useAuthUser from '../hooks/useAuthUser.js'
import { useQuery } from '@tanstack/react-query'
import { getStreamToken } from '../lib/api.js'

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;



function CallPage() {
  const {id: callId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if this is a duplicate tab
  useEffect(() => {
    const existingCall = sessionStorage.getItem('currentCallId');
    if (existingCall && existingCall !== callId) {
      toast.error('You already have an active call in another tab.');
      navigate('/');
    }
    sessionStorage.setItem('currentCallId', callId);
    return () => sessionStorage.removeItem('currentCallId');
  }, [callId, navigate]);

  const [call, setCall] = useState(null);
  const [client, setClient] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData} = useQuery({
    queryKey : ["StreamToken"],
    queryFn: getStreamToken,
    enabled : !!authUser,
  })

  useEffect(() => {
    // Cleanup existing call and client if they exist
    if (client && call) {
      try {
        call.leave();
        client.disconnect();
      } catch (error) {
        console.error('Error cleaning up previous call:', error);
      }
    }

    const initCall = async() => {
      if(!tokenData?.token || !authUser || !callId ) return;

      try {
        console.log("Starting stream video client...");

        const user = {
          id: authUser._id,
          name: authUser.name,
          image: authUser.profilePic,
        }

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default",  callId);
        await callInstance.join({create:true});

        setCall(callInstance);
        setClient(videoClient);
      } catch (error) {
         console.error("Error joining call", error);
         toast.error("Failed to join call. Please try again.");
      }
      finally{
        setIsConnecting(false);
      }
    };

    initCall();

    return () => {
      // Cleanup when component unmounts
      if (client && call) {
        try {
          call.leave();
          client.disconnect();
        } catch (error) {
          console.error('Error cleaning up call on unmount:', error);
        }
      }
    };
  },[tokenData, authUser, callId]);

  if (isLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) return navigate("/");

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage


