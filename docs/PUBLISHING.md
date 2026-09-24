# Publishing skill catalogs

Serve the contents of `catalogs/` as static HTTP files.

Example mapping:
- `catalogs/global/`   -> `https://ai.example.com/skills/global/`
- `catalogs/dotnet/`  -> `https://ai.example.com/skills/dotnet/`

Each catalog root must expose `index.json`. For each entry OpenCode fetches files from `<catalog>/<skill-name>/<file>`.
Increment the entry `version` whenever any file in that skill changes.
