import yamljs from "yamljs"
import { CONFIG_FILE } from "./index"

export const ExtensionsArray = ["module", "interface", "display", "layout"] as const
export type ExtensionType = typeof ExtensionsArray[number]

export interface ExtensionItem {
	name: string
	type: ExtensionType
	repo: string
	owner: string
	token?: string
}

export const ReadConfig = (): Promise<ExtensionItem[]> => {
	return new Promise((resolve, reject) => {
		yamljs.load(CONFIG_FILE(), (result) => {
			if (!result) {
				reject(`failed to read extensions yaml file at ${CONFIG_FILE}`)
				return
			}

			resolve(result as ExtensionItem[])
		})
	})
}