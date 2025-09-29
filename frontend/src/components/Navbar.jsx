import React from "react";
import useAuthUser from "../hooks/useAuthUser";
import { Link, useLocation } from "react-router";
import { BellIcon, Globe, LogOutIcon } from "lucide-react";
import ThemeSelector from './ThemeSelector.jsx';
import useLogout from "../hooks/useLogout.js";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/chat");

//  Initial implementation of logout mutation
//   const queryClient = useQueryClient();

//   const {
//     mutate: logoutMutation,
//     isPending,
//     error,
//   } = useMutation({
//     mutationFn: async () => {
//       await axiosInstance.post("/auth/logout");
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["authUser"] });
//     },
//   });

  const {logoutMutation } = useLogout(); //using custom hook for logout.

  const handleLogout = () => {
    logoutMutation();
  };
  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full">
          {/* LOGO - ONLY IN THE CHAT PAGE */}
          {isChatPage && (
            <div className="pl-5">
              <Link to="/" className="flex items-center gap-2.5">
                <Globe className="size-9 text-primary" />
                <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
                  Nexus
                </span>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle">
                <BellIcon className="h-6 w-6 text-base-content opacity-70" />
              </button>
            </Link>
          </div>

          
          <ThemeSelector />

          <div className="avatar">
            <div className="w-9 rounded-full">
              <img src={authUser?.profilePic} alt="User Avatar" rel="noreferrer" /> {/* rel="noreferrer" hides the referrer info (your site URL) when opening a link. It’s mainly a privacy feature.    */}
            </div>
          </div>

          {/* Logout button */}
          <button className="btn btn-ghost btn-circle" onClick={handleLogout}>
            <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

//Logout flow : 
//1.User clicks logout button
//2.from handleLogout() , logoutMutation() is called.
//3.flow goes to useLogout hook, where we have mutation function , 'logout', that calls the logout api.
//4.flow goes to api.js, where post request is made to '/auth/logout' endpoint.
//5.flow goes to server-> auth.route.js-> logout controller-> logout function.
//6.logout function calls res.clearCookie("jwt"); which basically deletes the cookie,  and returns res.status(200).json({ success: true, message: "Logged out successfully!"});
//7.flow returns back to useLogout hook , where onSuccess we have queryClient.invalidateQueries({ queryKey: ["authUser"] });
//8.now we have no cookie associated with the request, and we have no user data in the cache, so we are redirected to login page.


//navbar.jsx -> logoutMutation -> useLogout -> mutations fn (logout) -> api.js -> axiosInstance.post("/auth/logout") -> server -> auth.route.js -> logout controller -> logout function -> res.clearCookie("jwt"); -> res.status(200).json({ success: true, message: "Logged out successfully!"});