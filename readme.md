# vercel-env-push-action

## Usage

<!-- prettier-ignore -->
```yaml
steps:
  - name: Push env to vercel
    uses: pentible/vercel-env-push-action@v1.0.0
    with:
      vercelToken: ${{ secrets.VERCEL_TOKEN }}
      projectId: vercel-env-push-action
      target: production
      # NOTE: you'll probably want to pull this from some other action or step
      envs: ${{ secrets.env }}
      # additional options
      # gitBranch: ${{ github.head_ref || github.ref_name }}
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
