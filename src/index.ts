import { cleanFolder } from "cleanup";
import { downloadFile, DOWNLOAD_PATH } from "download";
import { extractZip, EXTRACT_PATH } from "extract";

downloadFile({
	url: "https://github.com/directus/directus/archive/refs/tags/v9.0.0-rc.93.zip",
	name: "directus"
})
	.then(filename =>
		extractZip(filename)
			.catch(e => console.error(e))
	)
	.catch(e => console.error(e))
	.then(() => {
		cleanFolder(DOWNLOAD_PATH)
		cleanFolder(EXTRACT_PATH)
	})