import {useEffect,useState} from "react";
import { getAvatarViewUrl,uploadAvatarFlow } from "../api/avatarApi";
import { validateAvatarFile } from "../utils/avatarValidation";

export function useAvatarUpload(userId){
    const [selectedFile,setSelectedFile]=useState(null);
    const [previewUrl,setPreviewUrl]=useState(null);
    const [error,setError]=useState("");
    const [uploading,setUploading]=useState(false);
    const [avatarUrl,setAvatarUrl]=useState(null);
    const [successMessage,setSuccessMessage]=useState("");

    useEffect(()=>{
        if(!userId) return;
        loadCurrentAvatar();
    },[userId]);
    useEffect(()=>{
        return () => {
            if(previewUrl){
                URL.revokeObjectURL(previewUrl);
            }
        };
    },[previewUrl]);
    async function loadCurrentAvatar(){
        try{
            const url=await getAvatarViewUrl(userId);
            setAvatarUrl(url || null);
        }catch(err){
            console.error("Error loading avatar:",err);
        }}
    function handleFileChange(e){
        const file=e.target.files[0];
        setError("");
        setSuccessMessage("");
        const validationError=validateAvatarFile(file);
        if(validationError){
            setError(validationError);
            setSelectedFile(null);
            setPreviewUrl(null);
            return;
        }
        setSelectedFile(file);
        if(previewUrl){
            URL.revokeObjectURL(previewUrl);
        }

        const url=URL.createObjectURL(file);
        setPreviewUrl(url);
    }
    async function handleUpload(){
        if(!selectedFile){
            setError("No file selected.");
            return;
        }
        try{
            setUploading(true);
            setError("");
            setSuccessMessage("");

            await uploadAvatarFlow(selectedFile);
            setSuccessMessage("Avatar uploaded successfully!");
            setSelectedFile(null);
            if(previewUrl){
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
            await loadCurrentAvatar();
        }catch(err){
            console.error("Error uploading avatar:",err);
            setError("Failed to upload avatar. Please try again.");
        }
        finally{
            setUploading(false);
        }
    }
    return {
        selectedFile
        ,previewUrl,
        avatarUrl,
        error,
        uploading,
        successMessage,
        handleFileChange,
        handleUpload,
        loadCurrentAvatar
    }
}