import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { acceptFriendRequest, getFriendRequests } from "../lib/api";
import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon } from "lucide-react";
import { formatTimeAgo } from "../lib/timeUtils.js";
import NoNotificationsFound from "../components/NoNotificationsFound";


function NotificationPage() {
  const queryClient = useQueryClient();

  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ['friendRequests'],
    queryFn:getFriendRequests,
  });

  const{mutate: acceptRequestMutation, isLoading: loadingAcceptRequest } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests']});
      queryClient.invalidateQueries({ queryKey: ['friends']});
    },
  });

  // Error faced during project :  All buttons were flickering after sending friend request to one User, due to shared 'isPending' state , so we created a new state 'loadingAcceptRequest' for each button.

  const incomingRequests = friendRequests?.incomingRequests || [];
  
  // Filter accepted requests to show only those from the last week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const acceptedRequests = friendRequests?.acceptedRequests?.filter(
    (req) => new Date(req.createdAt) >= oneWeekAgo
  ) || [];  // Only show requests from the last week
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
          Notifications
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {incomingRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 text-primary" />
                  Friend Requests
                  <span className="badge badge-primary ml-2">
                    {incomingRequests.length}
                  </span>
                </h2>

                <div className="space-y-3">
                  {incomingRequests.map((request) => (
                    <div
                      key={request._id}
                      className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="avatar w-14 h-14 rounded-full bg-base-300">
                              <img
                                src={request.sender.profilePic}
                                alt={request.sender.fullName}
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {request.sender.fullName}
                              </h3>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                <span className="badge badge-secondary badge-sm">
                                  Native: {request.sender.nativeLanguage}
                                </span>
                                <span className="badge badge-outline badge-sm">
                                  Learning: {request.sender.learningLanguage}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => acceptRequestMutation(request._id)}
                            disabled={loadingAcceptRequest}
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ACCEPTED REQS NOTIFICATONS */}
            {acceptedRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-success" />
                  New Connections
                </h2>

                <div className="space-y-3">
                  {acceptedRequests.map((notification) => (
                    <div
                      key={notification._id}
                      className="card bg-base-200 shadow-sm"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-start gap-3">
                          <div className="avatar mt-1 size-10 rounded-full">
                            <img
                              src={notification.recipient.profilePic}
                              alt={notification.recipient.fullName}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              {notification.recipient.fullName}
                            </h3>
                            <p className="text-sm my-1">
                              {notification.recipient.fullName} accepted your
                              friend request
                            </p>
                            <p className="text-xs flex items-center opacity-70">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                          <div className="badge badge-success">
                            <MessageSquareIcon className="h-3 w-3 mr-1" />
                            New Friend
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
              <NoNotificationsFound />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default NotificationPage;


//***Notifications Page Flow */

//1.useQuery hook is called with queryFn as "getFriendRequests".
//2.getFriendRequests fn is called from api.js file and it makes a GET request to "/users/friend-requests" endpoint.
//3.request goes to server and it redirects it to user.route.js -> user.controller.js , where we have "getFriendRequests" fn.
//4.getFriendRequests fn is called and it returns the array of friend requests, containing incoming and accepted requests. res.status(200).json({ incomingRequests, acceptedRequests})
//5.api.js file returns the friend requests to the useQuery hook.
//6.Now we have got incoming and accepted requests in the useQuery hook.We display them at notifications page.
//7.We can accept incoming requests using useMutation hook with mutationFn as "acceptFriendRequest".
//8.When we accept a request, useMutation hook is called. It calls mutationFn "acceptFriendRequest" from api.js file.
//9."acceptFriendRequest" fn makes a PUT request to `/users/friend-request/${requestId}/accept` endpoint.
//10.request goes to server and it redirects it to user.route.js -> user.controller.js , where we have "acceptFriendRequest" fn.
//11.acceptFriendRequest fn is called and it updates the status of the friend request to accepted. saves it to database. then add each user to the other's friends array. and returns success message.
//12.api.js file returns the success message to the useMutation hook.
//13.Then onSuccess callback is called. It invalidates the "friendRequest" and "friends" queries. This will trigger a refetch of the data.
//14.This will immediately update the ui, removing the accepted request from the list and adding the new friend to the friends list.


