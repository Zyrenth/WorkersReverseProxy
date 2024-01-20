export interface Env {
	ALLOWED_TOKENS: string;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === '/robots.txt') {
			let body = 'User-agent: *\nDisallow: *';

			return new Response(body, { status: 200 });
		}

		const tokens = (env.ALLOWED_TOKENS ?? '').split('; ');
		const authorization = request.headers.get('X-Authorization');

		if (!authorization) {
			return Response.json({
				message: 'Unauthorized', code: 401, errors: [{
					headers: {
						'X-Authorization': {
							required: true,
							valid: null
						}
					}
				}]
			}, { status: 401, headers: { 'X-From-Proxy': 'true' } });
		}

		const token = authorization.replace('Bearer ', '');

		if (!tokens.includes(token)) {
			return Response.json({
				message: 'Forbidden', code: 403, errors: [{
					headers: {
						'X-Authorization': {
							required: true,
							valid: false
						}
					}
				}]
			}, { status: 403, headers: { 'X-From-Proxy': 'true' } });
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
			}, { status: 400, headers: { 'X-From-Proxy': 'true' } });
		}

		const _headers = new Headers(request.headers);
		for (const header of ['X-Authorization', 'Host', 'Referer', 'Origin']) _headers.delete(header);

		for (const [key] of _headers.entries()) {
			if (key.startsWith('cf-') || key.toLowerCase().includes('ip')) {
				_headers.delete(key);
			}
		}

		const response = fetch(urlQuery, {
			body: request.body,
			headers: _headers,
			method: request.method,
		});

		return response;
	},
};
