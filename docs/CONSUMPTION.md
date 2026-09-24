# Consumer model

A project opts in by listing only its required skill catalogs in `opencode.jsonc`.

Example .NET project:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "skills": [
    "https://ai.example.com/skills/global/",
    "https://ai.example.com/skills/dotnet/"
  ]
}
```

Do not install all company skills in `~/.config/opencode/skills`, because that makes them globally discoverable for the developer.
