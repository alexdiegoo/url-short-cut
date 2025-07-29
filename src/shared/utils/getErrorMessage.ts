export function getErrorMessage(error: unknown): string {
    console.error(error)
    if(error instanceof Error) return error.message
    return String(error)
}