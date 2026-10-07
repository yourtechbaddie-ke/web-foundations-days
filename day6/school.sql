PRAGMA foreign_keys = ON;

-- Students: one row per student.
CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

-- Courses: one row per course.
CREATE TABLE courses (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE
);

-- Enrolments: joins students to courses and stores the student's grade.
-- The composite primary key prevents the same student taking the same course twice.
CREATE TABLE enrolments (
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Helps queries that look up all students enrolled in a course.
CREATE INDEX idx_enrolments_course_id ON enrolments(course_id);

-- Sample students.
INSERT INTO students (id, name, email) VALUES
    (1, 'Amina', 'amina@example.com'),
    (2, 'Brian', 'brian@example.com'),
    (3, 'Chloe', 'chloe@example.com'),
    (4, 'David', 'david@example.com');

-- Sample courses.
INSERT INTO courses (id, name, code) VALUES
    (1, 'Database Systems', 'DB101'),
    (2, 'Web Foundations', 'WEB101'),
    (3, 'System Design', 'SD101');

-- Five enrolments.
INSERT INTO enrolments (student_id, course_id, grade) VALUES
    (1, 1, 'A'),
    (1, 2, 'B+'),
    (2, 1, 'B'),
    (2, 3, 'A-'),
    (3, 2, 'A');

-- 1. All courses for one student (by name).
SELECT courses.name AS course_name, courses.code
FROM students
JOIN enrolments ON enrolments.student_id = students.id
JOIN courses ON courses.id = enrolments.course_id
WHERE students.name = 'Amina'
ORDER BY courses.name;

-- 2. All students on one course.
SELECT students.name, students.email
FROM students
JOIN enrolments ON enrolments.student_id = students.id
JOIN courses ON courses.id = enrolments.course_id
WHERE courses.name = 'Database Systems'
ORDER BY students.name;

-- 3. Number of students per course.
-- LEFT JOIN keeps courses with zero enrolments in the result.
SELECT courses.name AS course_name,
       COUNT(enrolments.student_id) AS student_count
FROM courses
LEFT JOIN enrolments ON enrolments.course_id = courses.id
GROUP BY courses.id, courses.name
ORDER BY courses.name;

-- 4. Students who have no enrolments.
SELECT students.name, students.email
FROM students
LEFT JOIN enrolments ON enrolments.student_id = students.id
WHERE enrolments.student_id IS NULL
ORDER BY students.name;

-- 5. Update one enrolment's grade.
UPDATE enrolments
SET grade = 'A+'
WHERE student_id = 1
  AND course_id = 2;
