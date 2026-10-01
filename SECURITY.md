# Security

Do not commit application source, credentials, Firebase configuration,
keystores, build output, logs, lockfiles copied from private repositories, or
private repository metadata here. Signing and TestFlight upload are
manual-dispatch only and may read credentials only from the protected
`private-source-read` Environment. The archive workflow checks out private
source only into temporary runner storage; the upload-only workflow downloads
the fixed public artifact and never checks out private source. Private source,
signing material, the temporary App Store Connect key file, and the downloaded
IPA must be removed from the runner unconditionally.

Report security issues privately to the Hacom Holdings repository owner. Do
not open a public issue with sensitive details.

