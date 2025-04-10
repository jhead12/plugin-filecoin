import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { CeramicClient } from '@ceramicnetwork/http-client';
import { create } from 'ipfs-http-client';
import { TileDocument } from '@ceramicnetwork/stream-tile';

const ceramic = new CeramicClient('http://localhost:7007');
const ipfs = create({ host: 'localhost', port: 5001, protocol: 'http' });
const apollo = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

describe('Storage Tests', () => {
  let ceramicDoc: any;
  let ipfsHash: string;

  beforeEach(async () => {
    ceramicDoc = await TileDocument.create(ceramic, { name: 'Test' });
    const result = await ipfs.add(JSON.stringify({ message: 'Hello, world!' }));
    ipfsHash = result.path;
  });

  it('should create a Ceramic document', async () => {
    expect(ceramicDoc).toHaveProperty('content');
    expect(ceramicDoc.content).toEqual({ name: 'Test' });
  });

  it('should upload data to IPFS', async () => {
    const ipfsData = await ipfs.cat(ipfsHash);
    const result = JSON.parse(ipfsData.toString());
    expect(result).toEqual({ message: 'Hello, world!' });
  });

  it('should query GraphQL endpoint', async () => {
    const query = gql`
      query {
        getPost(id: "1") {
          title
          content
        }
      }
    `;
    const { data } = await apollo.query({ query });
    expect(data.getPost).toEqual({
      title: 'Test Post',
      content: 'This is a test post.',
    });
  });

  afterEach(async () => {
    // Cleanup logic (if needed)
  });
});