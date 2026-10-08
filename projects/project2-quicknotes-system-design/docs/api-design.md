# QuickNotes API Design

The production QuickNotes API is a versioned REST API for authenticated users. It uses JSON request and response bodies and standard HTTP methods/status codes.

Base URL:

`https://api.example.com/api/v1`

## Authentication endpoints

| Method | Path | Description | Success |
|---|---|---|---|
| POST | /auth/register | Create a user account | 201 Created |
| POST | /auth/login | Authenticate and issue a token | 200 OK |

Authenticated note and tag endpoints require an access token, for example:

`Authorization: Bearer <access-token>`

## Note endpoints

| Method | Path | Description | Success |
|---|---|---|---|
| GET | /notes | List the authenticated user's notes | 200 OK |
| GET | /notes/{id} | Get one note owned by the authenticated user | 200 OK |
| POST | /notes | Create a note | 201 Created |
| PATCH | /notes/{id} | Update a note | 200 OK |
| DELETE | /notes/{id} | Delete a note | 204 No Content |

## Tag endpoints

| Method | Path | Description | Success |
|---|---|---|---|
| GET | /tags | List the authenticated user's tags | 200 OK |
| POST | /notes/{id}/tags/{tagId} | Add an existing user-owned tag to a note | 201 Created |
| DELETE | /notes/{id}/tags/{tagId} | Remove a tag from a note | 204 No Content |

All resource access is scoped to the authenticated user. A client cannot select another user's `userId` to bypass authorization.

## Create note request

**POST /api/v1/notes**

Request:

```json
{
  "title": "Shopping list",
  "body": "Milk, bread and eggs",
  "tagIds": [2, 5]
}
```

Response — **201 Created**:

```json
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
```

## List notes request

**GET /api/v1/notes?limit=10&offset=0**

Response — **200 OK**:

```json
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
```

The server should enforce safe pagination limits, for example a maximum `limit` of 100.

## Update note request

**PATCH /api/v1/notes/101**

Request:

```json
{
  "title": "Updated shopping list",
  "body": "Milk, bread, eggs and fruit"
}
```

Response — **200 OK** returns the updated note representation.

## Delete note request

**DELETE /api/v1/notes/101**

Response:

**204 No Content**

The response has no response body.

## HTTP status codes and error handling

- **400 Bad Request:** malformed JSON, missing required fields, invalid field values, or invalid pagination parameters.
- **401 Unauthorized:** no valid authentication credentials were supplied.
- **403 Forbidden:** the user is authenticated but does not have permission to access the requested resource.
- **404 Not Found:** the requested note, tag, or user-owned resource does not exist.
- **500 Internal Server Error:** an unexpected server-side failure occurred.

Example error body:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required."
  }
}
```

All error responses use a predictable JSON shape so clients can display friendly messages without depending on server-specific text.

## REST design principles used

- Collections use plural nouns such as `/notes` and `/tags`.
- HTTP methods express the operation instead of action names in URLs.
- `POST` creates resources.
- `GET` reads resources.
- `PATCH` partially updates resources.
- `DELETE` removes resources.
- Successful creation returns **201 Created**.
- Successful deletion returns **204 No Content**.
- The API is versioned under `/api/v1` so future breaking changes can be introduced without silently breaking existing clients.
