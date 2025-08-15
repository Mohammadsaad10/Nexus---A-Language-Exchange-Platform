import { useQueryClient,useMutation } from '@tanstack/react-query';
import { signup } from '../lib/api.js';


const useSignUp = () => {
  const queryClient = useQueryClient();

  const {
    mutate, //mutation in simple words - sending data to server.
    isPending,
    error,
  } = useMutation({
    mutationFn: signup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });

  return {isPending,error,signUpMutation : mutate};
}

export default useSignUp