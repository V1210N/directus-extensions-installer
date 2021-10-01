import { cleanFolder } from "./cleanup";
import { downloadFile } from "./download";
import { extractZip } from "./extract";
import fs from "fs"
import { ReadConfig } from "./read";

export const DIRECTUS_DIR = process.env.DIRECTUS_DIR ?? "/directus"
export const EXTENSIONS_DIR = `${DIRECTUS_DIR}/extensions`
export const DOWNLOAD_DIR = process.env.EXTENSIONS_DOWNLOAD_DIR ?? "./downloads"
export const EXTENSIONS_CONFIG_FILE = process.env.EXTENSIONS_CONFIG_FILE ?? "./extensions.yaml"

if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR)

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
		cleanFolder(DOWNLOAD_DIR)
		fs.rmdirSync(DOWNLOAD_DIR)

		if (process.env.NODE_ENV !== "production") cleanFolder(EXTENSIONS_DIR)
	})
})