export interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  resource_type?: "auto" | "image" | "video" | "raw";
  public_id?: string;
  transformation?: Array<{
    width?: number;
    height?: number;
    crop?: string;
    gravity?: string;
    quality?: string;
    fetch_format?: string;
  }>;
}

export interface CloudinaryDeleteResult {
  result: string;
}
