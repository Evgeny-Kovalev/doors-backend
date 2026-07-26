import { NotFound, S3ServiceException } from '@aws-sdk/client-s3';

export function isS3ServiceException(error: unknown): error is S3ServiceException {
	return error instanceof S3ServiceException;
}

/** HeadObject: 404 or NotFound means the object does not exist. */
export function isS3ObjectMissing(error: unknown): boolean {
	if (!isS3ServiceException(error)) return false;

	return (
		error.$metadata.httpStatusCode === 404 ||
		error instanceof NotFound ||
		error.name === 'NotFound'
	);
}

export function getS3ErrorMessage(error: unknown): string {
	if (!isS3ServiceException(error)) return String(error);

	const status = error.$metadata.httpStatusCode;
	return status !== undefined
		? `${error.name} (${status}): ${error.message}`
		: `${error.name}: ${error.message}`;
}
