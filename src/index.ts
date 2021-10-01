import { cleanFolder } from "./cleanup";
import { downloadFile } from "./download";
import { extractZip } from "./extract";
import fs from "fs"
import { ReadConfig } from "./read";

export const DIRECTUS_DIR = () => process.env.DIRECTUS_DIR ?? "/directus"
export const EXTENSIONS_DIR = () => `${DIRECTUS_DIR()}/extensions`
export const DOWNLOAD_DIR = () => process.env.DOWNLOAD_DIR ?? "./downloads"
export const CONFIG_FILE = () => process.env.CONFIG_FILE ?? "./extensions.yaml"

const main = async (): Promise<void> => {
	if (!fs.existsSync(DOWNLOAD_DIR())) fs.mkdirSync(DOWNLOAD_DIR())

	return new Promise((resolve, reject) =>
		ReadConfig()
			.then(async extensions => {
				Promise.all(
					extensions.map(extension =>
						downloadFile(extension)
							.then(filename =>
								extractZip(filename, extension.type)
									.catch(e => reject(e))
							)
							.catch(e => reject(e))
					)
				).finally(() => {
					cleanFolder(DOWNLOAD_DIR(), true)

					if (process.env.NODE_ENV !== "production") cleanFolder(EXTENSIONS_DIR())

					if (process.env.KEEP_CONFIG !== "true" && process.env.KEEP_CONFIG === "production") {
						console.log("removing extensions config file")
						
						// May contain sensitive data like auth tokens so we get rid of it afterwards.
						fs.unlinkSync(CONFIG_FILE())
					}

					resolve()
				})
			})
			.catch(e => reject(e))
	)
}
export default main