interface Env {
	appBucket: R2Bucket;
}

export default {

	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		const bucket = env.appBucket;

		const url = new URL(request.url);
		const pathname = url.pathname
		if (pathname.length == 0) {
			return new Response('operation not found')
		}
		const key = pathname.slice(1);
		
		/// 获取所有上传的文件列表
		if (key == 'getObjectList') {
			if (request.method != "GET") {
				return new Response("Method not allow", { status: 405 });
			}
			const list = await bucket.list({
				include: ['customMetadata']
			})
			
			let resp = Response.json(list)
			resp.headers.set('Access-Control-Allow-Origin', '*')
			resp.headers.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS')
			resp.headers.set('Access-Control-Max-Age', '86400')
			return resp
		}
		/// 上传文件，Free账户最大只支持100M，如果上传大于100M文件请使用S3 API
		if (key == 'upload') {
			if (request.method != "PUT" && request.method != "POST") {
				return new Response("Method not allow", { status: 405 });
			}
			const formData = await request.formData()
			const fileName = formData.get('fileName')
			if (fileName != null && typeof fileName == 'string') {
				const title = formData.get('title')
				const desc = formData.get('desc')
				if (typeof title == 'string' && typeof desc == 'string') {
					const obj = await bucket.put(fileName, formData.get('file'), {
						customMetadata: {
							title,
							desc,
						}
					});
					let resp = Response.json({
						code: 200,
						message : `Put ${fileName} successfully!`,
						data: obj
					})
					resp.headers.set('Access-Control-Allow-Origin', '*')
					resp.headers.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS')
					resp.headers.set('Access-Control-Max-Age', '86400')
					return resp
				}
			}
			return new Response('upload failed')
		}
		/// 下载文件
		if (key == 'getObject') {
			if (request.method != "GET") {
				return new Response("Method not allow", { status: 405 })
			}
			const params = url.searchParams
			const name = params.get('name') ?? ''
			
			const object = await bucket.get(name);
			if (object === null) {
				return new Response("Object Not Found", { status: 404 })
			}
			const headers = new Headers()
			object.writeHttpMetadata(headers)
			headers.set("etag", object.httpEtag)
			let resp = new Response(object.body)
			resp.headers.set('Access-Control-Allow-Origin', '*')
			resp.headers.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS')
			resp.headers.set('Access-Control-Max-Age', '86400')
			return resp
		}
		/// 获得文件信息
		if (key == 'getObjectInfo') {
			if (request.method != "GET") {
				return new Response("Method not allow", { status: 405 })
			}
			const params = url.searchParams
			const name = params.get('name') ?? ''
			
			const object = await bucket.get(name);
			if (object === null) {
				return new Response("Object Not Found", { status: 404 })
			}
			let resp = Response.json({
					code: 200,
				message: 'success',
				data: object
			})
			resp.headers.set('Access-Control-Allow-Origin', '*')
			resp.headers.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS')
			resp.headers.set('Access-Control-Max-Age', '86400')
			return resp
		}
		/// 删除文件
		if (key == 'delete') {

			const formData = await request.formData()
			const fileName = formData.get('fileName') as string

			const object = await bucket.get(fileName);
			if (object === null) {
				return new Response("Object Not Found", { status: 404 })	
			}

			await bucket.delete(fileName)

			let resp = Response.json({
				code: 200,
				message : `Delete ${fileName} successfully!`,
			})
			resp.headers.set('Access-Control-Allow-Origin', '*')
			resp.headers.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS')
			resp.headers.set('Access-Control-Max-Age', '86400')
			return resp
		}
		
		return new Response('operation not found')
	},
};