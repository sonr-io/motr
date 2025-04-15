import createPlugin from '@extism/extism';

const plugin = await createPlugin(
    'signer.wasm',
    { useWasi: true }
);

export async function helloWorld() {
  const input = "Hello World";
  let out = await plugin.call("count_vowels", input);
  console.log(out.text());
  return out;
}
