import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OSS = require("ali-oss");
import { randomUUID } from "crypto";
import { extname } from "path";

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

export type UploadedImageFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

type UploadResult = {
  url: string;
  key: string;
};

@Injectable()
export class UploadService {
  private readonly objectPrefix: string;
  private readonly cdnBaseUrl: string;
  private readonly maxFileSize: number;
  private readonly bucket: string;
  private readonly region: string;
  private readonly client: OSS | null;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.getEnv("OSS_ACCESS_KEY_ID");
    const accessKeySecret = this.getEnv("OSS_ACCESS_KEY_SECRET");
    this.bucket = this.getEnv("OSS_BUCKET");
    this.region = this.getEnv("OSS_REGION");
    this.cdnBaseUrl = this.getEnv("OSS_CDN_BASE_URL");
    this.objectPrefix = this.normalizePrefix(
      this.getEnv("OSS_OBJECT_PREFIX") || "uploads",
    );
    this.maxFileSize = this.getNumberEnv(
      "OSS_MAX_FILE_SIZE",
      DEFAULT_MAX_FILE_SIZE,
    );

    if (accessKeyId && accessKeySecret && this.bucket && this.region) {
      this.client = new OSS({
        accessKeyId,
        accessKeySecret,
        bucket: this.bucket,
        region: this.region,
      });
    } else {
      this.client = null;
    }
  }

  async uploadImage(
    file: UploadedImageFile | undefined,
    type: string | undefined,
  ): Promise<UploadResult> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException("No file uploaded");
    }
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      throw new BadRequestException("Only image files are supported");
    }
    if (file.size > this.maxFileSize) {
      const maxSizeMb = Math.max(1, Math.round(this.maxFileSize / 1024 / 1024));
      throw new BadRequestException(`File size must be <= ${maxSizeMb}MB`);
    }
    if (!this.client) {
      throw new InternalServerErrorException(
        "OSS is not configured. Set OSS_REGION, OSS_BUCKET, OSS_ACCESS_KEY_ID and OSS_ACCESS_KEY_SECRET.",
      );
    }

    const folder = this.normalizeType(type || "common");
    const objectKey = this.buildObjectKey(
      folder,
      file.originalname,
      file.mimetype,
    );

    try {
      await this.client.put(objectKey, file.buffer, {
        headers: {
          "Content-Type": file.mimetype,
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Upload failed";
      throw new InternalServerErrorException(
        `Failed to upload to OSS: ${message}`,
      );
    }

    return {
      key: objectKey,
      url: this.buildPublicUrl(objectKey),
    };
  }

  private buildObjectKey(
    folder: string,
    originalName: string,
    mimeType: string,
  ): string {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const extension = this.resolveExtension(originalName, mimeType);
    const uid = randomUUID().replace(/-/g, "").slice(0, 12);
    return `${this.objectPrefix}/${folder}/${year}/${month}/${Date.now()}-${uid}.${extension}`;
  }

  private resolveExtension(originalName: string, mimeType: string): string {
    const fileExt = extname(originalName).toLowerCase().replace(".", "");
    if (/^[a-z0-9]{1,8}$/.test(fileExt)) {
      return fileExt === "jpeg" ? "jpg" : fileExt;
    }

    const mimeExtMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/svg+xml": "svg",
      "image/bmp": "bmp",
      "image/avif": "avif",
    };
    return mimeExtMap[mimeType] || "jpg";
  }

  private buildPublicUrl(objectKey: string): string {
    if (this.cdnBaseUrl) {
      return `${this.cdnBaseUrl.replace(/\/+$/, "")}/${objectKey}`;
    }
    return `https://${this.bucket}.${this.region}.aliyuncs.com/${objectKey}`;
  }

  private normalizeType(type: string): string {
    const safe = type
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return safe || "common";
  }

  private normalizePrefix(prefix: string): string {
    return prefix.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "") || "uploads";
  }

  private getEnv(name: string): string {
    return (this.configService.get<string>(name) || "").trim();
  }

  private getNumberEnv(name: string, fallback: number): number {
    const rawValue = this.getEnv(name);
    if (!rawValue) {
      return fallback;
    }
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }
    return parsed;
  }
}
