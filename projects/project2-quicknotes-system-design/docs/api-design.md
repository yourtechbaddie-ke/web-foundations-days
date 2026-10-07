# QuickNotes API Design

The production QuickNotes API is a REST API for authenticated users to create, read, update and delete notes and manage tags.

## Endpoints

| Method | Path | Description | Success |
|---|---|---|---|
| GET | /api/v1/notes | List the authenticated user's notes | 200 OK |
| GET | /api/v1/notes/{id} | Get one note by ID | 200 OK |
| POST | /api/v1/notes | Create a note | 201 Created |
| PATCH | /api/v1/notes/{id} | Update a note | 200 OK |
| DELETE | /api/v1/notes/{id} | Delete a note | 204 No Content |
| GET | /api/v1/tags | List the user's tags | 200 OK |
| POST | /api/v1/notes/{id}/tags/{tagId} | Add a tag to a note | 201 Created |
| DELETE | /api/v1/notes/{id}/tags/{tagId} | Remove a tag from a note | 204 No Content |

## Create note request

**POST /api/v1/notes**

Request:

    {
      "title": "Shopping list",
      "body": "Milk, bread and eggs",
      "tagIds": [2, 5]
    }

Response — **201 Created**:

    {
      "id": 101,
      "userId": 7,
      "title": "Shopping list",
      "body": "Milk, bread and eggs",
      "createdAt": "2026-10-07T12:00:00Z",
      "updatedAt": "2026-10-07T12:00:00Z",
      "tags": [
        { "id": 2, "name": "shopping" },
        { "id": 5, "name": "personal" }
      ]
    }

## List notes request

**GET /api/v1/notes?limit=10&offset=0**

Response — **200 OK**:

    {
      "data": [
        {
          "id": 101,
          "userId": 7,
          "title": "Shopping list",
          "body": "Milk, bread and eggs",
          "createdAt": "2026-10-07T12:00:00Z",
          "updatedAt": "2026-10-07T12:00:00Z"
        }
      ],
      "pagination": {
        "limit": 10,
        "offset": 0,
        "total": 1
      }
    }

## Error status codes

- **400 Bad Request:** malformed JSON, missing required fields, or invalid field values.
- **401 Unauthorized:** no valid authentication credentials were supplied.
- **403 Forbidden:** the user is authenticated but does not have permission to access the resource.
- **404 Not Found:** the requested note, tag, or user-owned resource does not exist.
- **500 Internal Server Error:** an unexpected server-side failure occurred.

Example error body:

    {
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "Title is required."
      }
    }

All error responses use a predictable JSON shape so clients can display friendly messages without depending on server-specific text.
