import createPlugin from '@extism/extism';

const plugin = await createPlugin(
    'https://cdn.sonr.io/bin/signer.wasm',
    { useWasi: true }
);

export async function sign(data) {
  let out = await plugin.call("sign", data);
  console.log(out.text());
  return out;
}
