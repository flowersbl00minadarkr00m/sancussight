# Research: BYOK Provider and Remediation UX

> Status: Supporting research
> Researched: 2026-07-24
> Authority: Rationale only; does not approve SancusSight behavior

## Open-source and platform patterns

### Open WebUI

- Adds OpenAI-compatible connections with URL and API key.
- Auto-discovers models when the provider exposes a compatible models
  endpoint and permits manual model IDs as a fallback.
- Supports multiple connections and enable/disable state.
- Its optional direct-browser connection stores a personal key in browser
  local storage and sends requests directly from the browser.

Sources:

- https://docs.openwebui.com/getting-started/quick-start/connect-a-provider/
- https://docs.openwebui.com/features/chat-conversations/direct-connections/
- https://github.com/open-webui/open-webui

### LobeHub

- Treats providers as manageable resources with list, view, create, edit,
  configure, test, toggle, and delete operations.
- Supports provider-specific configuration plus custom model providers.

Sources:

- https://lobehub.com/cli/
- https://github.com/lobehub/lobehub

### Dify

- Declares provider credential schemas.
- Validates provider credentials when the user saves them.
- Separates provider-level credentials from model-specific credentials.

Sources:

- https://docs.dify.ai/en/develop-plugin/dev-guides-and-walkthroughs/creating-new-model-provider
- https://github.com/langgenius/dify

### GitHub Copilot BYOK

- Supports provider type, base URL, key/token, and wire API selection.
- The Copilot app stores provider credentials in the operating-system keychain
  and does not read them back into the UI.

Sources:

- https://docs.github.com/en/copilot/how-tos/copilot-sdk/auth/byok
- https://github.blog/changelog/2026-06-23-github-copilot-app-support-for-byok/

### Windows credential APIs

- Windows desktop applications can write and read user-scoped credentials
  through the Win32 Credential Manager APIs `CredWriteW` and `CredReadW`.
- The first SancusSight implementation can therefore keep the Node dependency
  surface unchanged by calling a fixed local PowerShell/Win32 helper over
  standard input; it must not pass secrets in command arguments or return them
  to the browser.

Sources:

- https://learn.microsoft.com/windows/win32/api/wincred/nf-wincred-credwritew
- https://learn.microsoft.com/windows/win32/api/wincred/nf-wincred-credreadw

## SancusSight implications

1. Prefer a small connection resource with configure, test, model discovery,
   enable/disable, and delete.
2. Support native provider profiles plus one OpenAI-compatible custom profile
   instead of adding provider-specific UI branches.
3. Keep credentials in an operating-system credential store owned by the
   local companion; browser local storage is an observed pattern but a weaker
   fit for a governance product.
4. Show the exact selected finding fields before transmitting them to a model.
5. Treat model output as a proposal. Deterministic findings, verification,
   human approval, and upstream execution remain separate.
