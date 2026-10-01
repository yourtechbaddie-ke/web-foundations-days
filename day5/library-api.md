# Library API Design

A REST API for managing a library's books resource.

## Endpoints

### 1. List all books

- **Method:** GET
- **Path:** `/books`
- **Description:** Returns a list of all books in the library.
- **Success status:** `200 OK`
- **Example request:** `GET /books`

### 2. Get one book

- **Method:** GET
- **Path:** `/books/:id`
- **Description:** Returns the book with the specified ID.
- **Success status:** `200 OK`
- **Example request:** `GET /books/42`

### 3. Create a book

- **Method:** POST
- **Path:** `/books`
- **Description:** Creates a new book in the library.
- **Example request body:**
  ```json
  {
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "publishedYear": 1958
  }
  ```
- **Success status:** `201 Created`

### 4. Update a book

- **Method:** PUT
- **Path:** `/books/:id`
- **Description:** Replaces the book with updated information.
- **Example request body:**
  ```json
  {
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "publishedYear": 1958
  }
  ```
- **Success status:** `200 OK`

### 5. Delete a book

- **Method:** DELETE
- **Path:** `/books/:id`
- **Description:** Removes the specified book from the library.
- **Success status:** `204 No Content`
- **Example request:** `DELETE /books/42`

### 6. List books by author

- **Method:** GET
- **Path:** `/books?author=:author`
- **Description:** Returns books whose author matches the supplied query parameter.
- **Success status:** `200 OK`
- **Example request:** `GET /books?author=Chinua%20Achebe`

## Error codes

- **400 Bad Request:** The request is invalid, such as creating a book without the required `title` or `author` fields.
- **404 Not Found:** The requested book does not exist, such as requesting `GET /books/9999` when no book has that ID.
