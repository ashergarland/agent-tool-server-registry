## Registry change

Describe the registration or metadata update and cite its source evidence.

## Contributor checklist

- [ ] I own the server repository or am authorized to submit this change.
- [ ] Repository and source `server.json` metadata are accurate.
- [ ] Tool behavior, safety, consequence, and availability classifications are
      accurate.
- [ ] Authentication behavior and required configuration names are documented
      without values.
- [ ] Package, image, official MCP Registry, and Docker MCP catalog publication
      claims are verified.
- [ ] Hosted endpoint claims are stable, intentional, and currently available.
- [ ] This change contains no credentials, deployment identifiers, or personal
      information.
- [ ] `npm run verify` passes locally.
- [ ] `npm run verify:online` passes, or mismatches are explicitly explained
      above.
