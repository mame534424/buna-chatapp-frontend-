import axios from "axios";  
import API from "../../utils/axiosInstance";

export async function getAvatarUploadPresign(fileType){
    const res=await API.post(`/profile/avatar/presign?contentType=${encodeURIComponent(fileType)}`);
    return res.data;
}
export async function uploadAvatarToStorage(uploadUrl, file){
    await axios.put(uploadUrl,file,{
        headers:{
            "Content-Type": file.type
        },
        transformRequest:[(data) => data]
    })
}

export async function commitAvatar(bucket,path){
    const res=await API.post("/profile/avatar/commit",{bucket,path});
    return res.data;
}

export async function getAvatarViewUrl(userId){
    console.log("Fetching avatar for userId:", userId);
    const res=await API.get(`/profile/avatar/view/${userId}`);
    return res.data.url;
}

export async function uploadAvatarFlow(file){
    // 1. Get presigned URL
    const { uploadUrl, bucket, path } = await getAvatarUploadPresign(file.type);

    // 2. Upload to storage
    await uploadAvatarToStorage(uploadUrl, file);

    // 3. Commit avatar
    await commitAvatar(bucket, path);
    return {bucket,path};
}