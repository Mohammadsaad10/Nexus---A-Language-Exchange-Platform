import React, { useEffect, useState } from 'react'
import useAuthUser from '../hooks/useAuthUser.js'
import { useParams } from 'react-router';
import { getStreamToken } from '../lib/api.js';
import { useQuery } from '@tanstack/react-query';
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;


import { //Channels are at the core of Stream Chat. Within a channel you send/receive messages and interact with other users
  Channel, //The Channel component is a React Context provider that wraps all the logic, functionality, and UI for an individual chat channel
  ChannelHeader, //The ChannelHeader component displays pertinent information regarding the currently active channel, including image and title.
  Chat, //The Chat component is a React Context provider that wraps the entire Stream Chat application. It provides the ChatContext to its children, which includes the "StreamChat client instance".
  MessageInput, //The MessageInput component is a React Context provider that wraps all of the logic, functionality, and UI for the message input displayed in a channel. It provides the "MessageInputContext" to its children.
  MessageList, //The MessageList component renders a list of messages and consumes the various contexts setup from Channel. This component accepts a wide variety of optional props for customization needs.
  Thread, //The Thread component renders a list of replies tied to a single parent message in a channel’s main message list. A Thread maintains its own state and renders its own 'MessageList' and 'MessageInput' components.
  Window, //The Window component handles width changes in the main channel to ensure a seamless user experience when opening and closing a Thread.
} from "stream-chat-react";

import { StreamChat } from "stream-chat";

import { toast } from "react-hot-toast";

import CallButton from '../components/CallButton.jsx';
import ChatLoader from '../components/ChatLoader.jsx';

function ChatPage() {
 
  const { id: targetUserId } = useParams(); //useParams returns an object of key-value pairs of the URL parameters. i.e. {id: targetUserId}

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const {authUser} = useAuthUser();
  

  // working of useQuery in this chatPage --> 
  // 1.fetch the token from api.js -> getStreamToken function.
  // 2. only runs if authUser is available (enabled: !!authUser).

  const {data: tokenData } = useQuery({ //tokenData is the data returned by the getStreamToken function, basically from stream api.
    queryKey:["streamToken"],
    queryFn:getStreamToken,
    enabled: !!authUser, //enabled: !!authUser means that the query will only run if authUser is available.
  });// !! is used to convert it to boolean. i.e. if authUser is true -> true, if authUser is false -> false.
  
  // working of useEffect in this chatPage --> 
  // 1. it will run only when tokenData, authUser, targetUserId changes.
  // 2. if any one of them is false -> returns.
  // 3. if all are true -> execute.
  // 4. finally -> setLoading(false);
  // 5. if any error -> toast.error("Could not connect to chat. Please try again.");
  // 6. if any error -> setLoading(false);

  useEffect(() => {
    const initChat = async() =>{
      if(!tokenData?.token || !authUser) return;

      try {
        console.log("Initialising stream chat client....");

        //Why are we using in both backend and frontend seperately -> 
        //1. In backend we are using it to generate the stream token.
        //2. In frontend we are using it to connect to the stream chat server.
        //3. detailed explanation in notion file.
        
        const client = StreamChat.getInstance(STREAM_API_KEY);  //creating a new instance for client-side.

        client.connectUser(//connectUser is a method provided by stream chat to connect to the stream chat server.
          //It sets the current user and opens a websocket connection to the stream chat server.
          {
          id: authUser._id,
          name: authUser.name,
          image: authUser.profilePic,
         },
          tokenData.token , //token created by stream chat is JWT. JWT has three parts seperated by dots -> header.payload.signature
        );

        const channelId = [authUser._id, targetUserId].sort().join("-"); //for creating unique channel id.

        const currentChannel = client.channel("messaging", channelId, {
          members : [authUser._id, targetUserId]
        }); //creating channel of messaging type, with parameters -> channelId and members.

        await currentChannel.watch();
        //watch() method does following things : 
        //1.Creates channel if doesn't exists yet.(if user has right permissions to do so.).
        //2.It queries the channel state and returns members, watchers and messages.
        //3.It watches the channel and tells the server that you want recieve events when anything in this channel changes.

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
      //for ex. if origin is http://localhost:5173 then callUrl will be http://localhost:5173/call/123
      //This is useful in production environment, as we can't hardcode the origin .
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

//Working of code in chatPage ->

//1.We run useQuery to fetch token from api.js -> getStreamToken function. Only when we have "authUser" fetched from useAuthUser hook available.
//2.We run useEffect to initialize the chat client and channel. Only when we have "tokenData", "authUser" and "targetUserId" available.
//3.