import { cleanFolder } from "./cleanup";
import { downloadFile, DOWNLOAD_PATH } from "./download";
import { extractZip, EXTENSIONS_PATH } from "./extract";
import fs from "fs"
import { ExtensionsArray, ReadConfig } from "./read";

/*
	Since this code is run before Directus is initialized, the folders might not be in place, so we'll create them if they don't already exist.
*/
if (process.env.NODE_ENV === "production" && !fs.existsSync("/directus")) {
	fs.mkdirSync("/directus")
	fs.mkdirSync("/directus/extensions")
}
ExtensionsArray.forEach(extensionType => {
	const extensionFolderPath = `${EXTENSIONS_PATH}/${extensionType + "s"}`
	if (!fs.existsSync(extensionFolderPath)) fs.mkdirSync(extensionFolderPath)
})
if (!fs.existsSync(DOWNLOAD_PATH)) fs.mkdirSync(DOWNLOAD_PATH)
/* */

ReadConfig().then(async extensions => {
	Promise.all(
		extensions.map(extension =>
			downloadFile(extension)
				.then(filename =>
					extractZip(filename, extension.type)
						.catch(e => console.error(e))
				)
				.catch(e => console.error(e))
		)
	).finally(() => {
		cleanFolder(DOWNLOAD_PATH)
		if (process.env.NODE_ENV !== "production") cleanFolder(EXTENSIONS_PATH)
	})
})