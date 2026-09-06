export const PLAYGROUND_TITLE = 'GamersCommunity Playground';

export const PLAYGROUND_BANNER = 'Playground · MSW mocks';

export function shouldUseMocks(env: { useMocks?: boolean }): boolean {
    return env.useMocks === true;
}

export async function bootstrapMocks(
    enabled: boolean,
    startWorker: () => Promise<unknown>,
): Promise<void> {
    if (!enabled) return;
    await startWorker();
}
