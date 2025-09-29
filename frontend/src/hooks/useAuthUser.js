import { getAuthuser } from "../lib/api.js";
import { useQuery } from "@tanstack/react-query";

const useAuthUser = () => {
  //tanstack query.
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthuser,
    retry : false,

  });

    // If there's a 401 error, treat it as logged out instead of an error
    // This part is here because we want to handle the 401 error in the useAuthUser hook.
    // This is because we want to navigate to the login page when the user is logged out.
   
  if (authUser.error?.response?.status === 401) {
    return {
      isLoading: false,
      authUser: null
    };
  }

  // We can do this in api.js as well , by using try catch block , just return null if error in catch block.



  return { isLoading: authUser.isLoading, authUser: authUser.data?.user };
};

export default useAuthUser;
