import createPlugin from '@extism/extism';

const plugin = await createPlugin(
    'https://cdn.sonr.io/bin/signer.wasm',
    { useWasi: true }
);

export async function sign(data) {
  const input = "Hello World";
  let out = await plugin.call("sign", input);
  console.log(out.text());
  return out;
}
