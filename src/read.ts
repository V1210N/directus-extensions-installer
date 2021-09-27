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

const CONFIG_PATH = "/extensions-config/extensions.yaml"

export const ReadConfig = () : Promise<ExtensionItem[]> => {
	return new Promise((resolve) => {
		yamljs.load(CONFIG_PATH, (result) => {
			if (!result) {
				console.log(`failed to read extensions yaml file at ${CONFIG_PATH}`)
				resolve([])
			}

			resolve(result as ExtensionItem[])
		})
	})
}