# School Database Design

## Entities and tables

### students

The `students` table stores one record for each student. It has:

- `id` — INTEGER primary key.
- `name` — TEXT and NOT NULL.
- `email` — TEXT, NOT NULL and UNIQUE so two students cannot use the same email address.

### courses

The `courses` table stores one record for each course. It has:

- `id` — INTEGER primary key.
- `name` — TEXT and NOT NULL.
- `code` — TEXT, NOT NULL and UNIQUE so each course code identifies one course.

### enrolments

The `enrolments` table represents the fact that a student is enrolled on a course and stores the student's grade. It has:

- `student_id` — INTEGER, NOT NULL and a foreign key to `students(id)`.
- `course_id` — INTEGER, NOT NULL and a foreign key to `courses(id)`.
- `grade` — TEXT for the student's grade.

The composite primary key `(student_id, course_id)` prevents the same student from being enrolled on the same course more than once.

## Relationships

A **student-to-enrolment** relationship is one-to-many: one student can have many enrolment rows, while each enrolment belongs to one student.

A **course-to-enrolment** relationship is also one-to-many: one course can have many enrolment rows, while each enrolment belongs to one course.

Together, students and courses have a **many-to-many** relationship. One student can take many courses, and one course can have many students. The `enrolments` table is therefore a join table: each row connects one student to one course and can store relationship-specific data such as the grade.

## Index

I would add an index on `enrolments(course_id)`. The composite primary key starts with `student_id`, so it is useful for looking up a student's enrolments but is not the best index for searching by course. An index on `course_id` makes queries such as finding all students on a course and counting students per course faster.

## SQL or NoSQL?

I would choose **SQL** for this system. The data has clear entities, primary keys, foreign keys and structured relationships. Students and courses have a many-to-many relationship that is naturally represented with the `enrolments` join table, and SQL makes JOIN, GROUP BY and integrity constraints straightforward. The data is structured and relational rather than requiring the flexible document shape that would make NoSQL especially useful.
