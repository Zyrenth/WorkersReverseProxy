/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	ALLOWED_TOKENS: string;

	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const tokens = env.ALLOWED_TOKENS.split('; ');
		const authorization = request.headers.get('Authorization');

		if (!authorization) {
			return Response.json({ message: 'Unauthorized', code: 401 }, { status: 401 });
		}

		const token = authorization.replace('Bearer ', '');

		if (!tokens.includes(token)) {
			return Response.json({ message: 'Forbidden', code: 403 }, { status: 403 });
		}

		const urlQuery = new URL(request.url).searchParams.get('url');

		if (!urlQuery) {
			return Response.json({
				message: 'Bad Request', code: 400, errors: [{
					parameters: {
						url: {
							required: true
						}
					}
				}]
			}, { status: 400 });
		}

		const _headers = new Headers(request.headers);
		_headers.delete('Authorization');
		_headers.delete('Host');
		_headers.delete('Referer');
		_headers.delete('Origin');
		if (_headers.has('X-Authorization')) _headers.set('Authorization', _headers.get('X-Authorization') ?? '');

		const response = fetch(urlQuery, {
			body: request.body,
			headers: request.headers,
			method: request.method,
		});

		return response;
	},
};
