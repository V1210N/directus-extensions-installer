
### Introduction

This package is a utility for use with Directus. It retrieves and extracts extensions from Github repositories into your Directus installation.

Its creation was due to the need for a way to install Directus extensions when deploying on Kubernetes. You can run this tool before `npx directus bootstrap` to install extensions on your Directus pods by overriding the command argument. Example override:  
```
container:
    command:
        - sh
        - -c
    args:
        - CONFIG_FILE=/path/to/extensions.yaml npx directus-extensions-installer &&
          npx directus bootstrap && npx directus start;
```

Configuration for this tool is given in the form of environment variables for indicating directories as well as a `.yaml` file for the extensions themselves. This way you can mount a ConfigMap as a YAML file inside the image, and then just point the tool to it.

### Usage

`npx directus-extensions-installer`

You may also specify environment variables in the command line if you wish to override the defaults without setting environment variables.

### Values
| ENV          | DESCRIPTION                                                                                                     | DEFAULT           |
|--------------|-----------------------------------------------------------------------------------------------------------------|-------------------|
| DIRECTUS_DIR | Indicates the Directus installation directory. This variable is used to find out where to extract downloads to. | /directus         |
| EXTENSIONS_CONFIG_FILE  | Points to the .yaml file which includes the extensions' specifications.                                         | ./extensions.yaml |
| DOWNLOAD_DIR | Directory to download the extensions to. If it doesn't exist, it'll be created. This is deleted after use.                                                                        | ./downloads       |

&nbsp;  
If you wish to download a release from an extension repository located at https://github.com/foo/bar-extension, then you'd use an `extensions.yaml` that looked like so:

```
- name: extension-name
  owner: foo
  repo: bar-extension
  type: module
```

You can specifiy multiple extensions.

YAML config file model:

| PROPERTY | TYPE              | DESCRIPTION                                                                                                                                    |
|----------|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| name     | **required** _string_ | The extension's name.                                                                                                                          |
| owner    | **required** _string_ | Name of the repository's owner in the Github link. Example: github.com/foo/bar has 'foo' as the owner.                                         |
| repo     | **required** _string_ | Repository's name.                                                                                                                             |
| type     | **required** _string_ | Type of extension. Valid values include only one of the Directus extension types: "module", "interface", "display" or "layout".                |
| token    | **optional** _string_ | Github personal token. Only necessary if the specified repository is private. The token should have the appropriate permissions to read the repository. |

### Current limitations
- Currently only supports extensions available for download as .zip.
- Only downloads the latest release of the specified extension; no way to specify a tag.
- If run more than once it will install duplicates.
- Does not check for duplicates in extensions.yaml.
- Takes in arguments via environment values rather than command arguments.

### Recommendations
- Delete your extensions.yaml after usage if it has a Github token.