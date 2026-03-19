import API from "../../utils/axiosInstance"

export const getSignedViewUrl=async (attachmentId)=>{
    const response=await API.get(`storage/chat-media/view-url/${attachmentId}`);
    console.log("View URL response:", response);
    return response.data;
   

}