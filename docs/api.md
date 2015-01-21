# API Documentation

The present document aims at presenting, in a thorough and agreable way, the AIME-core API.

## Concept

The following API is fully RESTful and returns responses in a JSON format.

## Response format

*On success*

```json
{
	"status": "ok",
	"results": {},
	"warning": {}
}
```

*On error*

```json
{
	"status": "error",
	"error": {
		"code": 405,
		"title": "Bad Method",
		"expected": [
			"PUT",
			"POST"
		],
		"got": "GET"
	}
}
```

## Routes

*Legend*

* `<part>`, means a variable url part.
* `[part]`, means an optional url part.
* `[<part>]` means quite naturally an optional and variable url part.

### Models

Note that when the lang is not specified, the API will assume you want the default one as indicated in `config.api.defaultLang`.

*Endpoints*

* `/[<lang>]/book`
* `/[<lang>]/voc`
* `/[<lang>]/doc`
* `/[<lang>]/res`
* `/[<lang>]/scenars`

*Actions*

* `GET /[<lang>]/<model>` - Get every items.
* `GET /[<lang>]/<model>/id` - Get a single item.
* `GET /[<lang>]/<model>/id,id,id` - Get a discrete list of items.
* `GET /[<lang>]/<model>/search` - Search through items.
* `POST /<lang>/<model>` - Create an item.
* `PUT /[<lang>]/<model>/id` - Update an item.
* `DELETE /[<lang>]/<model>/id` - Delete an item.

*Pagination*

**TODO**: Through GET parameters.

### Relations

* `GET /[<lang>]/<mode>`
* `GET /[<lang>]/<crossing>`

### Utilities

* `POST /login`
* `POST /logout`
* `GET /[<lang>]/search`

## Legacy endpoint

For backward compatibility reasons, a legacy endpoint exists on this API so that ye olde interfaces may still work. Legacy routes are prefixed with `legacy` to distinguish them from the standard ones.
