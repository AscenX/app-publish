
export interface R2ObjectListResp {
    objects: [R2Object]
}

export interface UploadResult {
    code: number,
    message: string,
    data: R2Object
}