import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { completeOnboarding } from "../lib/api.js";


const useOnboarding = () => {

    const queryClient = useQueryClient();
    const {mutate, isPending } = useMutation({
        mutationFn : completeOnboarding,
        onSuccess :  () => {
          queryClient.invalidateQueries({ queryKey : ["authUser"], exact:true }); //exact true -> invalidates only the query with the exact key.
          toast.success("Onboarding completed successfully!");
        },
        onError: (error) => {
          toast.error(error.response.data.message);
        },
    }); 

    return {onboardingMutation : mutate, isPending };
}

export default useOnboarding;