import { cleanFolder } from "./cleanup";
import { downloadFile, DOWNLOAD_PATH } from "./download";
import { extractZip } from "./extract";
import fs from "fs"
import { ExtensionsArray, ReadConfig } from "./read";

export const DIRECTUS_DIR = process.env.DIRECTUS_DIR ?? "/directus"
export const EXTENSIONS_PATH = `${DIRECTUS_DIR}/extensions`

/*
	Since this code is run before Directus is initialized, the folders might not be in place, so we'll create them if they don't already exist.
*/
// Create Directus dir and extensions folder if these haven't already been initialized.
if (!fs.existsSync(DIRECTUS_DIR)) fs.mkdirSync(DIRECTUS_DIR)
if (!fs.existsSync(`${DIRECTUS_DIR}/extensions`)) fs.mkdirSync(`${DIRECTUS_DIR}/extensions`)

// Create a folder for each extension type
ExtensionsArray.forEach(extensionType => {
	const extensionFolderPath = `${EXTENSIONS_PATH}/${extensionType + "s"}`
	if (!fs.existsSync(extensionFolderPath)) fs.mkdirSync(extensionFolderPath)
})
// Create a folder for the downloads folder
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