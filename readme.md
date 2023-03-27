# Discussion Generator

A script for creating a series of discussions on a GH repo. This is geared
towards meeting notes to setup a week ahead.

Use the dot env file to provide the needed inputs:

- Slug, the URL slug of the category to add to
- Organization, the owner of the repository
- Repository, the name of the repository to add to
- Token, a personal access token. MUST be classic, GraphQL does not support
  scoped tokens.
