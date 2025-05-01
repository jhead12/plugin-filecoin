import { injectable, inject } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import type { ILogger } from './agent.user';

// Configuration
interface StorageConfig {
  encryptionAlgorithm: string;
  maxRetryAttempts: number;
  retryDelayMs: number;
}

// Data validation classes
export class AudioAssetDTO {
  id!: string;
  data!: string;
  name!: string;
  type!: string;
  ownerId!: string;
  createdAt!: number;
}

export class CommMessageDTO {
  id?: string;
  senderId!: string;
  recipientId!: string;
  assetId!: string;
  message!: string;
  timestamp!: number;
}

export class DocumentDTO {
  id!: string;
  data!: string;
  name!: string;
  type: 'ics' | 'excel' | 'word';
  ownerId!: string;
  createdAt!: number;
}

// Filecoin client interface
export interface FilecoinClient {
  upload(data: Uint8Array, walletAddress: string): Promise<string>;
  download(id: string, walletAddress: string): Promise<Uint8Array>;
}

const defaultFilecoinClient: FilecoinClient = {
  async upload(data: Uint8Array, walletAddress: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return uuidv4();
  },
  async download(id: string, walletAddress: string): Promise<Uint8Array> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return new Uint8Array(Buffer.from('mock data'));
  },
};

@injectable()
export class AgentStorage {
  private readonly config: StorageConfig;

  constructor(
    @inject('FilecoinClient') private readonly client: FilecoinClient,
    @inject('ILogger') private readonly logger: ILogger,
    config: StorageConfig = {
      encryptionAlgorithm: 'AES-GCM',
      maxRetryAttempts: 3,
      retryDelayMs: 1000,
    }
  ) {
    this.config = config;
  }

  private async withRetry<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= this.config.maxRetryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error: Error) {
        lastError = error;
        this.logger.warn(`${operationName} failed (attempt ${attempt}/${this.config.maxRetryAttempts}): ${error.message}`);
        if (attempt < this.config.maxRetryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelayMs));
        }
      }
    }
    throw new Error(`${operationName} failed after ${this.config.maxRetryAttempts} attempts: ${lastError?.message}`);
  }

  private encryptData(data: string, algorithm = 'AES-GCM'): Uint8Array {
    try {
      // TODO: Implement real encryption (e.g., Web Crypto API)
      return new TextEncoder().encode(data);
    } catch (error: Error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  private decryptData(data: Uint8Array): string {
    try {
      // TODO: Implement real decryption
      return new TextDecoder().decode(data);
    } catch (error: Error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  async upload(data: string, walletAddress: string): Promise<string> {
    return this.withRetry(async () => {
      const encryptedData = this.encryptData(data, this.config.encryptionAlgorithm);
      const storageId = await this.client.upload(encryptedData, walletAddress);
      this.logger.info('File uploaded successfully', { storageId, walletAddress });
      return storageId;
    }, 'Storage upload');
  }

  async download(storageId: string, walletAddress: string): Promise<string> {
    return this.withRetry(async () => {
      const data = await this.client.download(storageId, walletAddress);
      const decrypted = this.decryptData(data);
      this.logger.info('File downloaded successfully', { storageId, walletAddress });
      return decrypted;
    }, 'Storage download');
  }

  async storeAudioAsset(asset: Omit<AudioAssetDTO, 'id' | 'createdAt'>, walletAddress: string): Promise<AudioAssetDTO> {
    const audioAsset = plainToClass(AudioAssetDTO, {
      ...asset,
      id: uuidv4(),
      createdAt: Date.now(),
    });

    const errors = await validate(audioAsset);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map(e => e.toString()).join(', ')}`);
    }

    const assetData = JSON.stringify(audioAsset);
    const storageId = await this.upload(assetData, walletAddress);
    this.logger.info('Audio asset stored', { name: asset.name, storageId, walletAddress });
    return audioAsset;
  }

  async getAudioAsset(storageId: string, walletAddress: string): Promise<AudioAssetDTO> {
    const data = await this.download(storageId, walletAddress);
    const asset = plainToClass(AudioAssetDTO, JSON.parse(data));
    const errors = await validate(asset);
    if (errors.length > 0) {
      throw new Error(`Invalid audio asset data: ${errors.map(e => e.toString()).join(', ')}`);
    }
    return asset;
  }

  async storeCommMessage(message: Omit<CommMessageDTO, 'id' | 'timestamp'>, walletAddress: string): Promise<CommMessageDTO> {
    const commMessage = plainToClass(CommMessageDTO, {
      ...message,
      id: uuidv4(),
      timestamp: Date.now(),
    });

    const errors = await validate(commMessage);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map(e => e.toString()).join(', ')}`);
    }

    const messageData = JSON.stringify(commMessage);
    const storageId = await this.upload(messageData, walletAddress);
    this.logger.info('Communication message stored', { assetId: message.assetId, storageId, walletAddress });
    return commMessage;
  }

  async storeDocument(doc: Omit<DocumentDTO, 'id' | 'createdAt'>, walletAddress: string): Promise<DocumentDTO> {
    const document = plainToClass(DocumentDTO, {
      ...doc,
      id: uuidv4(),
      createdAt: Date.now(),
    });

    const errors = await validate(document);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map(e => e.toString()).join(', ')}`);
    }

    if (document.type === 'ics' && !document.data.includes('BEGIN:VCALENDAR')) {
      throw new Error('Invalid iCalendar format');
    }
    if (document.type === 'excel' && !document.data.startsWith('data:application/vnd.openxmlformats')) {
      throw new Error('Invalid Excel format');
    }
    if (document.type === 'word' && !document.data.startsWith('data:application/vnd.openxmlformats')) {
      throw new Error('Invalid Word format');
    }

    const docData = JSON.stringify(document);
    const storageId = await this.upload(docData, walletAddress);
    this.logger.info('Document stored', { name: document.name, storageId, walletAddress });
    return document;
  }

  async getDocument(storageId: string, walletAddress: string): Promise<DocumentDTO> {
    const data = await this.download(storageId, walletAddress);
    const doc = plainToClass(DocumentDTO, JSON.parse(data));
    const errors = await validate(doc);
    if (errors.length > 0) {
      throw new Error(`Invalid document data: ${errors.map(e => e.toString()).join(', ')}`);
    }
    return doc;
  }
}