# Cloudflare Workers proxy

Well, it's literally what you think, you can proxy HTTP/HTTPS requests through Cloudflare's Workers.

# How to use this?

First of all, rename the `wrangler.example.toml` file to `wrangler.toml`.
Then edit the `ALLOWED_TOKENS` env. variable based on your needs, these tokens will allow you to authenticate to this proxy.

- If you only need 1 token then just paste it there, no need to add anything else.
- If you need multiple tokens you can separate them with `; ` (the space is required otherwise it won't work).

After you've done this you can publish the worker.

If you published your worker you can pull up `Postman` (for example) to test this out. After you've opened Postman make a HTTPS request to your worker:

- Use one of the tokens you set earlier, to authenticate you must use the `X-Authorization` header and not the regular `Authorization` header as that will be forwarded.
- You can specify a URL using the `url` parameter.

The following will be forwarded:

- Headers except headers that start with `cf-` or contain `ip` or it's one of the following: `X-Authorization`, `Host`, `Referer`, `Origin`
- The method you used to request the proxy.
- The body of your request.

If the proxy returns an error (such as `Unauthorized`, `Forbidden` or `Bad request`) it will have the `X-From-Proxy` set as `true`.
