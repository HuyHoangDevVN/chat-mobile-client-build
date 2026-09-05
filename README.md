# Chat Mobile Public Build Broker

This public repository contains workflow specifications only. It does not
contain Chat Mobile or shared-types source code.

The private-source iOS verification workflow is manual-only and may run only
after both controls pass:

1. A repository-scoped GitHub App is installed only on
   `hacom-holding-dx/chat-mobile-client` and
   `hacom-holding-dx/chat-shared-types`, with `Contents: Read` only.
2. Current GitHub documentation confirms that standard GitHub-hosted runners
   are free for public repositories, and the official GitHub App token action
   supports repository-scoped checkout. Recheck these sources before each
   release:
   - https://docs.github.com/actions/reference/runners/github-hosted-runners
   - https://github.com/actions/create-github-app-token

For iOS 1.6.3 build 29, the broker checks out the fixed private release SHA,
runs source gates, signs and exports exactly one IPA, validates its bundle and
signature, and retains it as a seven-day Actions artifact. TestFlight upload
remains a separate manual workflow in the private mobile repository.

Release signing is manual and fail-closed. The protected Environment must
already contain one Apple Distribution `.p12` and separate App Store profiles
for `com.hacom.chat` and `com.hacom.chat.share`. The workflow never enables
provisioning updates and never creates, revokes or replaces Apple signing
assets. It reads the Apple certificate/profile inventory before and after the
archive and fails if the metadata changes.

Signing values are GitHub Environment secrets. They must never be committed,
printed, uploaded as diagnostics, or made available to pull-request workflows.
Required signing secret names are `IOS_DISTRIBUTION_P12_BASE64`,
`IOS_DISTRIBUTION_P12_PASSWORD`, `IOS_APP_STORE_PROFILE_BASE64`, and
`IOS_SHARE_EXTENSION_PROFILE_BASE64`.

