/** OSS configuration — loaded from environment variables */

export interface OSSConfig {
  region?: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  bucket?: string;
  publicUrl?: string;
}