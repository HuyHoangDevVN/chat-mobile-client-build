# Chat Mobile Public Build Broker

This public repository contains workflow specifications only. It does not
contain Chat Mobile or shared-types source code.

GitHub Actions is intentionally disabled. The private-source iOS verification
specification must not be made executable or dispatched until both gates pass:

1. A repository-scoped GitHub App is installed only on
   `hacom-holding-dx/chat-mobile-client` and
   `hacom-holding-dx/chat-shared-types`, with `Contents: Read` only.
2. GitHub Support confirms in writing that a public workflow-only repository
   may use a standard hosted macOS runner to compile private source checked out
   with that App token.

The broker is compile-only: no signing, archive, IPA, TestFlight, artifacts,
caches, releases, packages, Pages, or deployment.

