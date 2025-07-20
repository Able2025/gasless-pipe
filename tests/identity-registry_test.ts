import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.5/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure user can create a profile",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user = accounts.get('wallet_1')!;

        const block = chain.mineBlock([
            Tx.contractCall('identity-registry', 'create-profile', 
                [types.utf8('testuser'), types.utf8('A test bio')], 
                user.address)
        ]);

        assertEquals(block.receipts.length, 1);
        block.receipts[0].result.expectOk();
    }
});

Clarinet.test({
    name: "Prevent duplicate profile creation",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user = accounts.get('wallet_1')!;

        const block = chain.mineBlock([
            Tx.contractCall('identity-registry', 'create-profile', 
                [types.utf8('testuser'), types.utf8('A test bio')], 
                user.address),
            Tx.contractCall('identity-registry', 'create-profile', 
                [types.utf8('testuser'), types.utf8('Another bio')], 
                user.address)
        ]);

        block.receipts[1].result.expectErr().expectUint(101);
    }
});