import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUserFriends } from '../lib/api'
import NoFriendsFound from '../components/NoFriendsFound.jsx'
import { Link } from 'react-router'
import { LANGUAGE_TO_FLAG } from '../constants/constants';

function FriendsPage() {
    const { data: friends = [], isLoading: loadingFriends } = useQuery({
        queryKey: ["friends"],
        queryFn: getUserFriends,
    });
    return (
        <div className="min-h-screen bg-base-200 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
                    Friends
                </h1>

                {loadingFriends ? (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg" />
                    </div>
                ) : friends.length === 0 ? (
                    <NoFriendsFound />
                ) : (
                    <div className="space-y-2">
                        {friends.map((friend) => (
                            <div key={friend._id} className=" bg-base-100 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-md">
                                <div className="flex justify-between p-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="avatar">
                                            <div className="w-12 h-12 rounded-full">
                                                <img src={friend.profilePic || '/default-avatar.png'} alt={friend.fullName} className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">
                                                {friend.fullName}
                                            </h3>
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                <span className="badge badge-secondary badge-sm">
                                                    {getLanguageFlag(friend.nativeLanguage)}
                                                    Native: {friend.nativeLanguage}
                                                </span>
                                                <span className="badge badge-outline badge-sm">
                                                    {getLanguageFlag(friend.learningLanguage)}
                                                    Learning: {friend.learningLanguage}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link to={`/chat/${friend._id}`} className="btn btn-outline">
                                        Message
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FriendsPage


export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}