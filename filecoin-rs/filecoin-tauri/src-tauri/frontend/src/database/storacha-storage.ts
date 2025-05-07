// database/storacha-storage.ts
import type { DawUser, AgentFile } from "../agent/agent.user";

export const db = {
    users: new Map<string, DawUser>(),
    files: new Map<string, AgentFile>(),
    async createUser(user: DawUser): Promise<void> {
        this.users.set(user.id, user);
    },
    async getUser(id: string): Promise<DawUser | null> {
        return this.users.get(id) || null;
    },
    async updateUser(id: string, user: DawUser): Promise<void> {
        if (!this.users.has(id)) throw new Error("User not found");
        this.users.set(id, user);
    },
    async createFile(file: AgentFile): Promise<void> {
        this.files.set(file.id, file);
    },
    async getFile(id: string): Promise<AgentFile | null> {
        return this.files.get(id) || null;
    },
    async updateFile(id: string, file: AgentFile): Promise<void> {
        if (!this.files.has(id)) throw new Error("File not found");
        this.files.set(id, file);
    },
};
