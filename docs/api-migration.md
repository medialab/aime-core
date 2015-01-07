# API migration note

### the book
`GET /fr/book`
With **book** you get the whole hierachic structure of the Book along with its text contents.
The **deprecated** api results is a flatten list of text element, where chapters, subheadings and paragraphs follow each other without any structure. The only way to differentiate elements is by their `type` property:

```json
[
	{
		"id": "36936",
		type: "1",
		content: "new book after upload",
		description: "",
	},
	{
		id: "36937",
		type: "2",
		content: "plan d’ensemble",
		description: "",
	},
]
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
		subheadings:[ ... ]
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
		"page": 14,
		"type": "chapter",
		"subheadings": [
			{	
				"title": "while we learn to ... existence.",
				"type": "subheading",
				"page": 19,
				"slug": "sub_18",
				"paragraphs": [
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



