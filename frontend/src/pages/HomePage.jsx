import React, { useEffect, useState } from 'react'
import {useQuery,useQueryClient,useMutation} from '@tanstack/react-query'
import { getOutgoingFriendReqs, getRecommendedUsers, getUserFriends, sendFriendRequest } from '../lib/api.js';
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from 'lucide-react';
import NoFriendsFound from '../components/NoFriendsFound.jsx';
import FriendCard from '../components/FriendCard.jsx';
import { capitalize } from '../lib/utils.js';
import { Link } from 'react-router';
import NoRecommendedUsers from '../components/NoRecommendedUsers.jsx';
import { getLanguageFlag } from '../utils/languageUtils.jsx';


function HomePage() {
  const queryClient = useQueryClient();
  
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });


  const { mutate: sendRequestMutation, isLoading: isSendingRequest } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]); 
  //outgoingFriendReqs comes from the useQuery that fetches pending friend requests.
  //whenever react query refetches and provides new data, React sees that 'outgoingFriendReqs' changed.
  //this triggers 'useEffect' function.


  return (
     <div className="p-4 sm:p-6 lg:p-8 ">
      <div className="container mx-auto space-y-10 ">

        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h2>
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>
        
        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} /> //key is used for unique identification of each element in the list.
            ))}
            
            {/* friends is an array from react query call data : friends = [] */}
            {/* each array element i.e. object containing id , name , etc. gets assigned to the friend variable */}
          </div>
        )}

        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Learners</h2>
                <p className="opacity-70">
                  Discover perfect language exchange partners based on your profile
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recommendedUsers.length === 0 ? (
               <NoRecommendedUsers/>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full">
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">{user.fullName}</h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Languages with flags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitalize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitalize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                      {/* Action button */}
                      <button
                        className={`btn w-full mt-2 ${
                          hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                        } `}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isSendingRequest}
                      >
                        {hasRequestBeenSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
        </section>
        


      </div>
     </div>
  )
}

export default HomePage

//1)****Fetching friends from database to display them on homepage.****

//to fetch the friends from database we use useQuery hook from react query with queryKey as "friends" and queryFn as getUserFriends.
//we destructure it to get data i.e. friends array of objects and isLoading state i.e. loadingFriends.

//flow of information => 
//1.useQuery hook is called with queryKey as "friends" and queryFn as getUserFriends.
//2.getUserFriends fn is called from api.js file and it makes a GET request to /users/friends endpoint.
//3.request goes to server and it redirects it to user.route.js -> user.controller.js , where we have getMyFriends fn.
//4.getMyFriends fn is called and it fetches the friends from database and array of user's friends populated with selected fields is returned to api.js file.
//5.api.js file returns the array of friends to the useQuery hook.
//6.useQuery hook returns the data to the HomePage component.
//7.returned data is stored in friends , which is an empty array by default.
//8.isLoading is set to true by default.
//9.if isLoading is true then we show a loading spinner and if friends array is empty then we show a no friends found message.
//10.else we show the friends in a grid layout.




//2)****Fetching recommended users to display them on homepage.****

//to fetch the recommended users from database we use useQuery hook from react query with queryKey as "users" and queryFn as getRecommendedUsers.
//we destructure it to get data i.e. recommendedUsers array of objects and isLoading state i.e. loadingUsers.

//flow of information => 
//1.useQuery hook is called with queryKey as "users" and queryFn as getRecommendedUsers.
//2.getRecommendedUsers fn is called from api.js file and it makes a GET request to '/users/' endpoint.
//3.request goes to server and it redirects it to user.route.js -> user.controller.js , where we have getRecommendedUsers fn.
//4.getRecommendedUsers fn is called and it fetches the recommended users from database and array of recommended users  is returned to api.js file.
//5.api.js file returns the array of recommended users to the useQuery hook.
//6.useQuery hook returns the data to the HomePage component.
//7.returned data is stored in recommendedUsers , which is an empty array by default.
//8.isLoading is set to true by default.
//9.if isLoading is true then we show a loading spinner and if recommendedUsers array is empty then we show a no recommended users found message.
//10.else we show the recommended users in a grid layout.




//3)****Fetching outgoing friend requests for disabling send friend request button. thereby preventing multiple requests to the same user.****

//to fetch the outgoing friend requests from database we use useQuery hook from react query with queryKey as "outgoingFriendReqs" and queryFn as getOutgoingFriendReqs.
//we destructure it to get data i.e. outgoingRequests array of objects.

//flow of information => 
//1.useQuery hook is called with queryKey as "outgoingFriendReqs" and queryFn as "getOutgoingFriendReqs".
//2."getOutgoingFriendReqs" fn is called from api.js file and it makes a GET request to '/users/outgoing-friend-requests' endpoint.
//3.request goes to server and it redirects it to user.route.js -> user.controller.js , where we have "getOutGoingFriendRequests" fn.
//4."getOutGoingFriendRequests" fn is called and it fetches the outgoing friend requests( status : pending ) from database and array of outgoing friend requests  is returned to api.js file.
//5.api.js file returns the array of outgoing friend requests to the useQuery hook.
//6.useQuery hook returns the data to the HomePage component.
//7.returned data is stored in "outgoingFriendReqs" , which is an empty array by default.


//4)****Using "outgoingFriendReqs" to disable send friend request button, which should be dynamic in behavior.


//If the user has already sent a friend request to the user, then the send friend request button should be disabled.
//Also this should update dynamically i.e. if I send request now then the button should be disabled , thereby preventing sending request again.

//We've used useEffect for storing the outgoingFriendReqs array of objects in a state variable.
//And useEffect for updating state.

// Data Flow:
// outgoingFriendReqs comes from React Query's useQuery.
// When the data loads or changes, the useEffect runs because outgoingFriendReqs is in its dependency array.
// Inside useEffect:
// A new Set is created.
// If there are outgoing friend requests, it loops through them and adds each recipient's ID to the Set.
// The Set is then stored in the state using setOutgoingRequestsIds.
// Why Not Use outgoingFriendReqs Directly?
// The Set provides faster lookups (O(1)) compared to searching through an array (O(n)).
// The state ensures that the Set is only recreated when outgoingFriendReqs changes, not on every render.
// Usage in the Component:
// The outgoingRequestsIds state is used to check if a "Send Request" button should be disabled for a particular user.
// This check is fast because it uses outgoingRequestsIds.has(userId), which is more efficient than searching through the outgoingFriendReqs array.

//while mapping "recommendedUser" array of objects to show them on homepage we check if the user has already sent a friend request to the user.
//i.e. if the user's id is present in the outgoingRequestsIds which is a set of ids .
//if yes then we store true in "hasRequestBeenSent" variable else false.
//then in action button we pass this variable as a prop to disable the button if true. also we change it's style to show that it's disabled.
//also "isSendingRequest" is true then also the button is disabled to prevent multiple requests to the same user.





//5)****Sending friend request to the backend.****

//to send a friend request to the backend we use useMutation hook from react query with mutationFn as sendFriendRequest.

//flow of information =>
//1.useMutation hook is called with mutationFn as "sendFriendRequest".
//2.sendFriendRequest fn is called from api.js file and it makes a POST request to '/users/friend-request/${receiverId}' endpoint.
//3.request goes to server and it redirects it to user.route.js -> user.controller.js , where we have "sendFriendRequest" fn.
//4.sendFriendRequest fn is called and it creates a new friend request between sender and reciever. res.status(201).json(friendRequest)
//5.api.js file returns the created friend request to the useMutation hook.

// till here send friend request is done.

//6.useMutation hook invalidates "outgoingFriendReqs" query. This cause useQuery to fetch the updated data from the server.
//7.this updated data then cause useEffect to run as it has "outgoingFriendReqs" as a dependency array.
//8.useEffect then updates the state variable "outgoingRequestsIds" with the updated data.
//9.Then further that set is used to disable the send friend request button for the user.



