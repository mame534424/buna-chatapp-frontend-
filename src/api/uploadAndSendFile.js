import axios from "axios";
import API from "./../utils/axiosInstance";


// helper function to detect the message type based on file extension
const detectMessageType = (file) => {
    if(file.type.startsWith("image/")){
        return "IMAGE";
    }
    if(file.type.startsWith("video/")){
        return "VIDEO";
    }
    if(file.type.startsWith("audio/")){
        return "AUDIO";
    }
    return "FILE";
}

export const uploadAndSendFile = async ({
    file,
    conversationId,
    senderId,
    content
}) => {
    //get presigned URL
    const presign=await API.post(`/storage/chat-media/presign`,
        {
        conversationId,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size
        }
    );
    console.log("Presign response:", presign);
    const presignData = presign.data;
    console.log("Presign data received:", presignData);
    const {bucket, path, uploadUrl} = presignData;
    


    //upload to storage
    const res=await axios.put(uploadUrl,file,{
        headers:{
            "Content-Type": file.type
        },
        transformRequest:[(data) => data]
    })
    console.log("Upload response:", res);
    //send message with attachment
    
    const message = await API.post("/messages/send", {
        conversationId,
        senderId,
        content,
        messageType: detectMessageType(file),
        attachments: [
            {
            bucket,
            path,
            originalName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            },
        ],
        });
    return message;
    
    }