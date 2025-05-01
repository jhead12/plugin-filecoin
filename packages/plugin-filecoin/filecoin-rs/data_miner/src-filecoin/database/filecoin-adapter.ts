import { DatabaseAdapter, type IDatabaseAdapter } from '@elizaos/core';
import type { Account, Goal, Memory, Participant, Relationship, RAGKnowledgeItem, UUID } from '@elizaos/core';
export class FilecoinDatabaseAdapter extends DatabaseAdapter<any> implements IDatabaseAdapter {
    private readonly storage: StorageProvider;
    private readonly baseDir: string;

    constructor(storage: StorageProvider, baseDir: string) {
        super();
        this.storage = storage;
        this.baseDir = baseDir;
    }

    async getAccountById(userId: UUID): Promise<Account | null> {
        const data = await this.storage.download(`account:${userId}`);
        if (data) {
            return JSON.parse(new TextDecoder().decode(data)) as Account;
        }
            return null;
    }

    async setParticipantUserState(roomId: UUID, userId: UUID, state: "FOLLOWED" | "MUTED" | null): Promise<void> {
        // Implementation
    }

    async getKnowledge(params: { id?: UUID; agentId: UUID; limit?: number; query?: string; conversationContext?: string }): Promise<RAGKnowledgeItem[]> {
        // Implementation
        return [];
    }

    async searchKnowledge(params: { agentId: UUID; embedding: Float32Array; match_threshold: number; match_count: number; searchText?: string }): Promise<RAGKnowledgeItem[]> {
        // Implementation
        return [];
    }

    async clearKnowledge(agentId: UUID, shared?: boolean): Promise<void> {
        // Implementation
    }
    async getCachedEmbeddings(params: any): Promise<{ embedding: number[]; levenshtein_score: number }[]> {
        // Implementation
        return [];
    }

    async searchMemories(params: { tableName: string; agentId: UUID; roomId: UUID; embedding: number[]; match_threshold: number; match_count: number; unique: boolean }): Promise<Memory[]> {
        // Implementation
        return [];
    }

    async searchMemoriesByEmbedding(embedding: number[], params: { match_threshold?: number; count?: number; roomId?: UUID; agentId?: UUID; unique?: boolean; tableName: string }): Promise<Memory[]> {
        // Implementation
        return [];
    }
}
