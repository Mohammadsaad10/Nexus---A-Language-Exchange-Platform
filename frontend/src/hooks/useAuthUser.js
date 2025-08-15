import { getAuthuser } from "../lib/api.js";
import { useQuery } from "@tanstack/react-query";

const useAuthUser = () => {
  //tanstack query.
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthuser,
    retry : 2,

  });

    // If there's a 401 error, treat it as logged out instead of an error
  if (authUser.error?.response?.status === 401) {
    return {
      isLoading: false,
      authUser: null
    };
  }



  return { isLoading: authUser.isLoading, authUser: authUser.data?.user };
};

export default useAuthUser;
