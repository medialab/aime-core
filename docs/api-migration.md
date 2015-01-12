# API migration note

### Rest, "soft" error handling and pagination

Response should show useful info about the request status. The response contains a property named `result` which is either a list of objects or a single object.
We genarally follow a simplified version of [json api standard proposal](http://jsonapi.org/)

Our Base URI permits to specify the language, useful for retrieve collections:
`/api/<lang>/<model>[/<func>]`
Special functions, listed later in this document, have to be appended to the request.

The response for **collection URI** could be:

```
GET /api/fr/voc

{
	"status": "ok",
	"kind": "aime/voc/list",
	result: [
		...
	]
}
```
response for **element URI**, or individual items:

```
GET /api/fr/voc/12345

{
	"status": "ok",
	"kind": "aime/voc",
	result: {
	
	}
}
```

response for **multiple element URI**, or well selected list:

```
GET /api/fr/voc/12345,1234

{
	"status": 200,
	"kind": "aime/voc/list",
	result: [
		...
	]
}
```

A response with **errors**, of any kind, contains just some fields:

```
GET /api/fr/voc/12345,1234

{
	"status": "error",
	"errors": [
		{
			"status": 404,
			"code" - An application-specific error code, expressed as a string value.
			"title" - A short, human-readable summary of the problem. It SHOULD NOT change from occurrence to occurrence of the problem, except for purposes of localization.
			"detail" - A human-readable explanation specific to this occurrence of the problem.
			
		}
	]
}

```

There could be **warnings**. We treat them as *soft* errors and we try to solve the problem automatically: what about pagination requests for the Book...? We round them to the next valid siblings and we output a smart collection of warnings.

```
GET /api/fr/book?page=32

{
	"status": "ok",
	"kind": "aime/book",
	"warnings":[{
		"detail": "Hey! Cannot paginate book, try with paragraphs, subheadings or chapter"
	}],
	"result": [
		...
	]
}
```

###### miscellaneus
In order to RESTRICT linked models we follow the api specification for links (of course we can omit the *lang* part):

`/api/<lang>/<model>/<ID>/links/<model>`

e.g use `/api/fr/voc/links/voc`
to retrieve JUST the list of the voc linked to a specific voc.


### pagination, sorting, search
Special HTTP params allow to manage pagination varibles, sorting and search functions (only suitables for GET requests). Note that soering and search function should be formatted as JSON dicts. Generic query search should be bound to a specific function `/api/<lang>/<model>/search?q=`

Here below you find RESERVED params

	page=3 (limit has to be specified too, otherwise is limited to 56 results per page)
	limit=120
	offset=50
	search={"title":"yea*"}
	sorting=["-title","-date"]
	q="free regexp or text query only after a search path"
	
Some useful RESERVED keywords apply to POST requests too:

	indent= (if it is present, a well-indented-human-readable version of the resource will be provided)
	verbose=
	
When the `verbose` param is present, the response is long and yes verbose showing the request params and help field for the :

```
GET /api/fr/book?verbose

{
	"status": "ok",
	"kind": "aime/book",
	"params": {	},
	"language": "fr",
	"method": "POST"
	"result":[	]
}

```
	

Normally pagination with page and limit does not apply to /book request.
Useful for infinite loading:

```
GET /api/fr/voc?limit=150&offset=375
```
to retrieve the next 150 vocs after the 375th voc

```
GET /api/fr/voc?page=234
```

### Help, exports and special functions.
To list all special function and all available endpoints:
```
GET /api
```

easy enough!
To download specific sections of the book or package documents:

```
GET /api/fr/book/export?page=32
```
according to the export method, some parameters may be added to the request.


(optional) A super smart help function could be appended to describe which properties can be queried and which param are available. This request ignores any http params and must apply to collections only:

```
GET /api/fr/book/help
```

or

```
GET /api/fr/book/search/help
```


### the book

With **book** you get the whole hierachic structure of the Book along with its text contents.
The **deprecated** api results is a flatten list of text element, where chapters, subheadings and paragraphs follow each other without any structure. The only way to differentiate elements is by their `type` property:

```json
GET /api/fr/book
{
	"result": [
		{
			"id": "36936",
			"type": "1",
			"content": "new book after upload",
			"description": "",
		},
		{
			"id": "36937",
			"type": "2",
			"content": "plan d’ensemble",
			"description": "",
		},
	]
}

```

The current structure, parsed by a javascript parser before being sent to the template (et oui, it is not a list... ordering is delegated to a list of simple ids):

```json
{
	"<chapterId>": { },
	"12121": {
		"id": 12121,
		"content": "introduction - une question choquante",
		"number": "&middot",
		"page": 11,
		"type": 2 ,
		"subheadings":[  ]
	},
}
```
where `chapterId` is the integer ID of the chapter item.
Chapters and subheadings expose the same properties, except for the name of the list of their children (`subheadings` vs `paragraphs`. Note that `number` is specific to the Book and used at `chapter` level only.

Here is the proposed structure:

```json
[
	{
		"title": "&middot; introduction - Trusting ... ?",
		"id": 1,
		"page": 14,
		"type": "chapter",
		"items": [
			{	
				"title": "while we learn to ... existence.",
				"type": "subheading",
				"page": 19,
				"id": 18,
				"slug": "sub_18",
				"items": [
					{
						"text": "We shall see ... basic.",
						"type": "paragraph",
						"page": 19,
						"slug": "sub_18",
					},
				]
			},
		]
	},
]
```




### documents, slides, resources & co.
todo