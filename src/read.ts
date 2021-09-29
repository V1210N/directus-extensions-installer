import yamljs from "yamljs"

export const ExtensionsArray = ["module", "interface", "display", "layout"] as const
export type ExtensionType = typeof ExtensionsArray[number]

export interface ExtensionItem {
	name: string
	type: ExtensionType
	repo: string
	owner: string
	token?: string
}

const EXTENSIONS_CONFIG_FILE = process.env.EXTENSIONS_CONFIG_FILE ?? "/extensions-config/extensions.yaml"

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