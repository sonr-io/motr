# Conventions

Here are a list of expected coding conventions for this project.

- ALWAYS ensure deployment is optimized for Cloudflare Workers Environment
- ALWAYS update configuration by modifying the @pkgs/config/ package and importing into our workspace
- ALWAYS design our architecture to maximize client-side functionality by keeping Network level business logic in WASM, Frontend UI in Vite, styling with Tailwind CSS 4, components with shadcn
- ALWAYS produce design components in @pkgs/ui/ in order to reduced code duplication and to have styling consistency
- ALWAYS produce shared react functionality inside @pkgs/react in order to maximize code re-use across @apps/
- ALWAYS keep cloudflare worker specific logic inside @src/ 
- ALWAYS keep our @devbox.lock
- React components must always be created inside @pkgs/ui/

## Claud Specific

- ALAWAYS ensure we are following current best reccomended coding practices by using the mcp::exa server
- ALWAYS ensure we are using the correct syntax for SDK and API dependencies by using the mcp::context7 server
