import yamljs from "yamljs"
import { EXTENSIONS_CONFIG_FILE } from "./index"

export const ExtensionsArray = ["module", "interface", "display", "layout"] as const
export type ExtensionType = typeof ExtensionsArray[number]

export interface ExtensionItem {
	name: string
	type: ExtensionType
	repo: string
	owner: string
	token?: string
}

export const ReadConfig = () : Promise<ExtensionItem[]> => {
	return new Promise((resolve) => {
		yamljs.load(EXTENSIONS_CONFIG_FILE, (result) => {
			if (!result) {
				console.log(`failed to read extensions yaml file at ${EXTENSIONS_CONFIG_FILE}`)
				resolve([])
			}

			resolve(result as ExtensionItem[])
		})
	})
}