# vercel-env-push-action

## Usage

<!-- prettier-ignore -->
```yaml
permissions:
  contents: read # for actions/checkout
  checks: read # for pentible/vercel-env-push-action
steps:
  - name: Push env to vercel
    uses: pentible/vercel-env-push-action@v1.0.0
    with:
      # ie. if check comes from a github action, it will be the job name
      check-name: ci
      # additional options & their defaults
      # ref: ${{ github.sha }}
      # owner: ${{ github.repository_owner }}
      # repo: ${{ github.event.repository.name }}
      # interval: 5
      # expected-conclusions: success,skipped
      # github-token: ${{ github.token }}
```

## Local dev

-   `./bin/dev initial setup`
-   run the following commands AND append to your shell configs (ie. `~/.zshrc`
    or `~/.bashrc`/`~/.bash_profile`)

```bash
eval "$(mise activate zsh)"
# or for bash
# eval "$(mise activate bash)"
```

-   (optionally) configure mise: `~/.config/mise/settings.toml`

```toml
trusted_config_paths = ["~/Projects"] # where ~/Projects is wherever you clone your repos
```

-   `dev start`
