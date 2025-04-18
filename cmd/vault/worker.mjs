export { default } from './build/worker.mjs';
import createPlugin from '@extism/extism';

const plugin = await createPlugin('https://cdn.sonr.io/bin/signer.wasm', { useWasi: true });

export class Vault {
  constructor(state, env) {
    this.state = state;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/vault/sign') {
      let out = await plugin.call("sign", request.body);
      return new Response(out.text(), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }
}
