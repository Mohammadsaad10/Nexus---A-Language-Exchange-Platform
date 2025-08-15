import React, { useEffect, useState } from 'react'
import useAuthUser from '../hooks/useAuthUser.js'
import { useParams } from 'react-router';
import { getStreamToken } from '../lib/api.js';
import { useQuery } from '@tanstack/react-query';
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;


import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";

import { StreamChat } from "stream-chat";

import { toast } from "react-hot-toast";

import CallButton from '../components/CallButton.jsx';
import ChatLoader from '../components/ChatLoader.jsx';

function ChatPage() {
 
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const {authUser} = useAuthUser();

  const {data: tokenData } = useQuery({
    queryKey:["streamToken"],
    queryFn:getStreamToken,
    enabled: !!authUser, //enabled: !!authUser means that the query will only run if authUser is available.
  });

  useEffect(() => {
    const initChat = async() =>{
      if(!tokenData?.token || !authUser) return;

      try {
        console.log("Initialising stream chat client....");
        
        const client = StreamChat.getInstance(STREAM_API_KEY); 

        client.connectUser(
          {
          id: authUser._id,
          name: authUser.name,
          image: authUser.profilePic,
         },
          tokenData.token , 
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currentChannel = client.channel("messaging", channelId, {
          members : [authUser._id, targetUserId]
        });

        await currentChannel.watch();

        setChatClient(client);
        setChannel(currentChannel);

      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      }
      finally{
        setLoading(false);
      }
    };

    initChat();

  },[tokenData,authUser,targetUserId]); //if one of these changes, the useEffect will run again. if becomes all true -> execute, if any one of them is false -> returns.

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`; //window.location.origin is used for getting the current origin of the application.

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;


  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
}

export default ChatPage