export enum FileTypes {
	DOC = 'DOC',
	IMG = 'IMG',
}

export type FileTypeInfoMap = {
	[key in FileTypes]: {
		path: string | undefined;
	};
};
