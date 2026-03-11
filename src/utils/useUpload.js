import * as React from 'react';
import { supabase } from './supabase'; // adjust path if needed

function useUpload() {
  const [loading, setLoading] = React.useState(false);

  const upload = React.useCallback(async (input) => {
    try {
      setLoading(true);

      let fileBody;
      let fileName;
      let mimeType;

      if ("reactNativeAsset" in input && input.reactNativeAsset) {
        const asset = input.reactNativeAsset;
        fileName = asset.name ?? asset.uri.split("/").pop();
        mimeType = asset.mimeType ?? 'application/octet-stream';

        const response = await fetch(asset.uri);
        fileBody = await response.blob();

      } else if ("base64" in input) {
        const base64 = input.base64;
        fileName = `upload_${Date.now()}`;
        mimeType = 'application/octet-stream';
        const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        fileBody = new Blob([byteArray]);

      } else if ("url" in input) {
        const response = await fetch(input.url);
        fileBody = await response.blob();
        fileName = input.url.split("/").pop() ?? `upload_${Date.now()}`;
        mimeType = fileBody.type ?? 'application/octet-stream';

      } else if ("buffer" in input) {
        fileBody = new Blob([input.buffer]);
        fileName = `upload_${Date.now()}`;
        mimeType = 'application/octet-stream';

      } else {
        throw new Error("Invalid input");
      }

      const filePath = `${Date.now()}_${fileName}`;

      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filePath, fileBody, { contentType: mimeType, upsert: false });

      if (error) throw new Error(error.message);

      const { data: publicData } = supabase.storage
        .from('uploads')
        .getPublicUrl(data.path);

      return { url: publicData.publicUrl, mimeType: mimeType || null };

    } catch (uploadError) {
      if (uploadError instanceof Error) return { error: uploadError.message };
      if (typeof uploadError === "string") return { error: uploadError };
      return { error: "Upload failed" };
    } finally {
      setLoading(false);
    }
  }, []);

  return [upload, { loading }];
}

export { useUpload };
export default useUpload;