import { injectable, inject } from "tsyringe";
import {
    type ILogger,
    type Database,
    AgentError,
    FileError,
    type DocumentDTO,
    Agent,
    type Intent,
    IntentRecord,
} from "./agent.types";
import {
    checkFilecoinConnection,
    type DataVector,
    searchFilecoinData,
} from "./filecoin.utils";

@injectable()
export class AgentUser {
    constructor(
        @inject("Database") private readonly db: Database,
        @inject("ILogger") private readonly logger: ILogger,
    ) {}

    /**
     * Records an intent execution tied to the agent's blockchain ID.
     * @param agentId - The agent's ID.
     * @param intent - The intent details.
     * @param result - The result of the intent execution.
     * @param error - Optional error message.
     */
    async recordIntent(
        agentId: string,
        intent: Intent,
        result: string,
        error?: string,
    ): Promise<void> {
        try {
            const agent = await this.db.getAgent(agentId);
            if (!agent) {
                throw new AgentError("Agent not found", "AGENT_NOT_FOUND");
            }
            agent.intentHistory = agent.intentHistory || [];
            agent.intentHistory.push({
                action: intent.action,
                timestamp: Date.now(),
                result,
                error,
                walletAddress: agent.walletAddress,
            });
            await this.db.updateAgent(agentId, agent);
            this.logger.info("Intent recorded:", {
                agentId,
                action: intent.action,
                walletAddress: agent.walletAddress,
            });
        } catch (err) {
            this.logger.error("Intent recording failed:", {
                error: err instanceof Error ? err.message : String(err),
                agentId,
            });
            throw new AgentError(
                `Failed to record intent: ${err instanceof Error ? err.message : String(err)}`,
                "DB_ERROR",
                { err },
            );
        }
    }

    /**
     * Searches Filecoin data for an agent.
     * @param agentId - The agent's ID.
     * @param query - The search query (e.g., CID or keyword).
     * @returns Array of data vectors.
     */
    async searchAgentData(
        agentId: string,
        query: string,
    ): Promise<DataVector[]> {
        try {
            const agent = await this.db.getAgent(agentId);
            if (!agent) {
                throw new AgentError("Agent not found", "AGENT_NOT_FOUND");
            }
            if (!(await checkFilecoinConnection())) {
                throw new AgentError(
                    "Filecoin network not connected",
                    "NETWORK_ERROR",
                );
            }
            const vectors = await searchFilecoinData(query);
            this.logger.info("Data search completed:", {
                agentId,
                query,
                results: vectors.length,
            });
            return vectors;
        } catch (error) {
            this.logger.error("Data search failed:", {
                agentId,
                query,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error instanceof AgentError
                ? error
                : new AgentError(
                      `Failed to search data: ${error instanceof Error ? error.message : String(error)}`,
                      "SEARCH_ERROR",
                      { error },
                  );
        }
    }
}
// agent.user.ts

@injectable()
export class AgentUser {
    constructor(
        @inject("Database") private readonly db: Database,
        @inject("ILogger") private readonly logger: ILogger,
    ) {}

    /**
     * Records an intent execution tied to the agent's blockchain ID.
     * @param agentId - The agent's ID.
     * @param intent - The intent details.
     * @param result - The result of the intent execution.
     * @param error - Optional error message.
     */
    async recordIntent(
        agentId: string,
        intent: Intent,
        result: string,
        error?: string,
    ): Promise<void> {
        try {
            const agent = await this.db.getAgent(agentId);
            if (!agent) {
                throw new AgentError("Agent not found", "AGENT_NOT_FOUND");
            }
            agent.intentHistory = agent.intentHistory || [];
            agent.intentHistory.push({
                action: intent.action,
                timestamp: Date.now(),
                result,
                error,
                walletAddress: agent.walletAddress,
            });
            await this.db.updateAgent(agentId, agent);
            this.logger.info("Intent recorded:", {
                agentId,
                action: intent.action,
                walletAddress: agent.walletAddress,
            });
        } catch (err) {
            this.logger.error("Intent recording failed:", {
                error: err instanceof Error ? err.message : String(err),
                agentId,
            });
            throw new AgentError(
                `Failed to record intent: ${err instanceof Error ? err.message : String(err)}`,
                "DB_ERROR",
                { err },
            );
        }
    }

    /**
     * Searches Filecoin data for an agent.
     * @param agentId - The agent's ID.
     * @param query - The search query (e.g., CID or keyword).
     * @returns Array of data vectors.
     */
    async searchAgentData(
        agentId: string,
        query: string,
    ): Promise<DataVector[]> {
        try {
            const agent = await this.db.getAgent(agentId);
            if (!agent) {
                throw new AgentError("Agent not found", "AGENT_NOT_FOUND");
            }
            if (!(await checkFilecoinConnection())) {
                throw new AgentError(
                    "Filecoin network not connected",
                    "NETWORK_ERROR",
                );
            }
            const vectors = await searchFilecoinData(query);
            this.logger.info("Data search completed:", {
                agentId,
                query,
                results: vectors.length,
            });
            return vectors;
        } catch (error) {
            this.logger.error("Data search failed:", {
                agentId,
                query,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error instanceof AgentError
                ? error
                : new AgentError(
                      `Failed to search data: ${error instanceof Error ? error.message : String(error)}`,
                      "SEARCH_ERROR",
                      { error },
                  );
        }
    }

    /**
     * Stores a document for an agent.
     * @param agentId - The agent's ID.
     * @param document - The document details.
     * @returns The stored document.
     */
    async storeDocument(
        agentId: string,
        document: DocumentDTO,
    ): Promise<DocumentDTO> {
        try {
            const agent = await this.db.getAgent(agentId);
            if (!agent) {
                throw new AgentError("Agent not found", "AGENT_NOT_FOUND");
            }
            await this.db.createDocument(document);
            const storedDoc = await this.db.getDocument(document.id);
            if (!storedDoc) {
                throw new FileError(
                    "Failed to retrieve stored document",
                    "DOCUMENT_ERROR",
                );
            }
            agent.documentIds.push(storedDoc.id);
            await this.db.updateAgent(agentId, agent);
            this.logger.info("Document stored:", {
                documentId: storedDoc.id,
                agentId,
                walletAddress: agent.walletAddress,
            });
            return storedDoc;
        } catch (error) {
            this.logger.error("Document storage failed:", {
                error: error instanceof Error ? error.message : String(error),
                agentId,
            });
            throw error instanceof AgentError || error instanceof FileError
                ? error
                : new FileError(
                      `Failed to store document: ${error instanceof Error ? error.message : String(error)}`,
                      "DOCUMENT_ERROR",
                      { error },
                  );
        }
    }
}
