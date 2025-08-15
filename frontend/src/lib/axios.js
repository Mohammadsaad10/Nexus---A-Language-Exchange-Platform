import axios from "axios";

//we would need to send the request to backend everytime we need, and we'd need to put the url , so to avoid doing that again and again , we'd setup axios Instance.

//basically this part is common in every api request so we seperate it and define in one place , so that we can use it wherever needed.

export const axiosInstance = axios.create({
    baseURL : 'http://localhost:5001/api',
    withCredentials : true, //send cookies with the request.
});

