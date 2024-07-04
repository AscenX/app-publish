const getIpaInstallUrl = (plistUrl: string) => {
	return `itms-services://?action=download-manifest&url=${plistUrl}`
}

const getIpaInstallPlist = (name: string, bundleId: string, installUrl: string, version: string) => {

	const installPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>items</key>
	<array>
		<dict>
			<key>assets</key>
			<array>
				<dict>
					<key>kind</key>
					<string>software-package</string>
					<key>url</key>
					<string>${installUrl}</string>
				</dict>
			</array>
			<key>metadata</key>
			<dict>
				<key>bundle-identifier</key>
				<string>${bundleId}</string>
				<key>bundle-version</key>
				<string>${version}</string>
				<key>kind</key>
				<string>software</string>
				<key>title</key>
				<string>${name}</string>
			</dict>
		</dict>
	</array>
</dict>
</plist>
`
	return installPlist
}

export {
	getIpaInstallPlist,
	getIpaInstallUrl
}