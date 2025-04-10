import { FilecoinClient } from '../../filecoin-rs/pkg/filecoin_rs';

// Use the FilecoinClient to interact with the Filecoin blockchain
const client = new FilecoinClient();
client.getBlockHeight().then(height => {
  console.log(`Current block height: ${height}`);
});

export class AgentIntentHandler {
    private client: FilecoinClient;

    constructor() {
        this.client = new FilecoinClient();
    }

    async executeIntent(intent: { action: string, data: string }): Promise<string> {
        if (intent.action === "store") {
            const data = Buffer.from(intent.data);
            return await this.client.upload(data);
        }
        throw new Error("Unsupported intent");
    }
}