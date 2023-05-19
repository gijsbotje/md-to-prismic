export interface convertOptions {
  fieldName: string,
  sliceName?: string,
  sliceVariation?: string,
  outputAs?: 'field' | 'slice',
}

export interface mdToPrismicOptions extends convertOptions {
  fileName: string,
}

export interface convertFilesOptions extends convertOptions {
  pathToConvert: string,
}

export interface filesToZipOptions extends convertOptions {
  pathToWriteTo: string,
}

export interface cliArguments extends convertOptions {
  pathToConvert: string,
}
