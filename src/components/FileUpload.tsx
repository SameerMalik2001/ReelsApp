"use client";
import React, { useRef, useState } from "react";
import { IKUpload } from "imagekitio-next";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { Loader2 } from "lucide-react";

interface FileUploadProps {
  onSuccess: (res: IKUploadResponse) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | 'video'
}


const FileUpload: React.FC<FileUploadProps> = ({
  onSuccess,
  onProgress,
  fileType = "image"
}) => {
  const ikUploadRefTest = useRef(null);
  const [uploading, setUploading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const onError = (err: { message: string }) => {
    console.log(err?.message);
    setError(err?.message);
    setUploading(false);
  };

  const handleSuccess = (res: IKUploadResponse) => {
    console.log("success: ", res);
    setError(null)
    setUploading(false);
    onSuccess(res);
  };

  const handleProgress = (evt: ProgressEvent) => {
    if (evt.lengthComputable && onProgress) {
      const percentageComplete = (evt.loaded / evt.total) * 100
      onProgress(percentageComplete)
    }
  };

  const handleStartUpload = () => {
    setUploading(true)
    setError(null)
  };

  const validateFiles = (file: File) => {
    if (fileType === "video") {
      if (!file.type.startsWith("video/")) {
        setError("Please upload a video file")
        return false
      }
      if (file.size > 100 * 1024 * 1024) {
        setError("File size exceeds 100MB")
        return false
      }
    } else {
      const validType = ["image/jpeg", "image/png", "image/webp"]
      if (!validType.includes(file.type)) {
        setError("Please upload a valid file (JPEG, PNG, WEBP")
        return false
      }
    }
    return false
  }

  return (
    <div className="space-y-2">
      <IKUpload
        fileName={fileType === "video" ? "vidoe" : "image"}
        useUniqueFileName={true}
        validateFile={validateFiles}
        folder={fileType === "video" ? '/videos' : '/images'}
        onError={onError}
        onSuccess={handleSuccess}
        onUploadProgress={handleProgress}
        onUploadStart={handleStartUpload}
        style={{ display: 'none' }}
        className="file-input file-input-bordered w-full"
      /> 
      {
        uploading && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <Loader2 className="animate-spin h-4 w-4"/>
            <span>Loading...</span>
          </div>
        )
      }

      {
        error && (
          <div className="text-sm text-error">
            {error}
          </div>
        )
      }
    </div>
  );
}