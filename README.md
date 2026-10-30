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

For the prepared iOS 1.6.5 build 39 archive, the broker checks out the fixed private release and
shared-types SHAs, runs source gates, signs and exports exactly one IPA,
validates its bundle and signature, and retains it as a seven-day Actions
artifact. The separate `ios-testflight-upload.yml` workflow is manual-only. It
checks the exact archive run, downloads the validated public artifact, verifies
the source SHA, version/build, signature and IPA checksum, checks App Store
Connect for a build collision, then uploads that same IPA. It does not check
out private source, archive, or export an app.

Both workflows require the protected `private-source-read` Environment and its
reviewer. The upload workflow uses the existing `APP_STORE_CONNECT_KEY_ID`,
`APP_STORE_CONNECT_ISSUER_ID`, and `APP_STORE_CONNECT_PRIVATE_KEY` Environment
secrets. It creates no API keys and runs only on the public broker's standard
GitHub-hosted macOS runner.

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


## iOS 1.6.5 (39) preparation

The archive workflow pins the approved release revision and the existing
shared-types snapshot. Preparation does not dispatch an archive or upload.
App Store Connect build availability must pass the existing pre-archive gate.

The upload-only workflow now pins successful archive [40998329606](https://github.com/HuyHoangDevVN/chat-mobile-client-build/actions/runs/40998329606),
broker revision `027b2f9c0a44400aa693d6bb974796f27c557a99`, and the validated
build 39 IPA checksum `615efafb6042ceb49b3f127be760654b19cd47f47c7c39fce38e1bb244a35d08`.
Local checksum and both app/ShareExtension version metadata match the archive
manifest. Upload reuses this artifact; never rebuild an IPA just to retry it.
