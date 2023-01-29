import logo from "./logo.svg";
import "./App.css";
import { useQuery, gql, useSubscription, useMutation } from "@apollo/client";
import { useEffect, useState } from "react";

const COURSES = gql`
  {
    getCourses {
      id
      title
      description
      price
      published
      total_students
    }
  }
`;

const CREATE_COURSE = gql`
  mutation createCourses(
    $title: String
    $description: String
    $published: Boolean
    $createdAt: String
    $updatedAt: String
    $price: Int
    $total_students: Int
  ) {
    createCourses(
      title: $title
      description: $description
      published: $published
      createdAt: $createdAt
      updatedAt: $updatedAt
      price: $price
      total_students: $total_students
    ) {
      title: title
      description: description
      price: price
      total_students: total_students
      published: published
      createdAt: createdAt
      updatedAt: updatedAt
    }
  }
`;

const DELETE_COURSE = gql`
  mutation DeleteCourses($deleteCoursesId: ID!) {
    deleteCourses(id: $deleteCoursesId)
  }
`;

const COURSES_CREATED = gql`
  subscription onCourseAdded {
    courseCreated {
      id
      title
      description
      price
      published
      total_students
    }
  }
`;

const COURSES_DELETED = gql`
  subscription onCourseDeleted {
    courseDeleted {
      id
      title
      description
      price
      published
      total_students
    }
  }
`;

function App() {
  const [courses, setCourses] = useState();
  const { data } = useQuery(COURSES);
  const [createMutation, { data: createData }] = useMutation(CREATE_COURSE);
  const [deleteMutation, { data: deleteData }] = useMutation(DELETE_COURSE);

  useEffect(() => {
    if (data) {
      setCourses(data.getCourses);
    }
  }, [data]);

  useSubscription(COURSES_CREATED, {
    onData: (data) => {
      setCourses(data.data.data.courseCreated);
    },
  });
  useSubscription(COURSES_DELETED, {
    onData: (data) => {
      setCourses(data.data.data.courseDeleted);
    },
  });

  const createCourse = (evt) => {
    evt.preventDefault();
    let items = document.getElementById("create-course-form").elements;
    let title = items.title.value;
    let description = items.description.value;
    let published = items.publishedOn.checked;
    let price = Number(items.price.value);

    createMutation({
      variables: {
        title: title,
        description: description,
        published: published,
        createdAt: "2022-02-21 16:58:05",
        updatedAt: "2022-02-21 16:58:05",
        price: price,
        total_students: 0,
      },
    });
  };

  const deleteCourse = (evt) => {
    evt.preventDefault();
    let items = document.getElementById("delete-course-form").elements;
    let id = items.id.value;
    deleteMutation({
      variables: {
        deleteCoursesId: id,
      },
    });
  };

  return (
    <div className="App">
      <div className="title">
        <h2>Course Dashboard</h2>
      </div>
      <div className="widgets">
        <div className="course">
          <h3>List of courses</h3>
          <ul>
            {courses &&
              courses.map((course) => (
                <li key={course.id}>
                  {course.id}--------{course.title} ---- {course.price}
                </li>
              ))}
          </ul>
        </div>
        <div className="create-course">
          <h3>Create course</h3>

          <form id="create-course-form">
            <div class="form-group">
              <label for="title">Title</label>
              <input
                type="text"
                class="form-control"
                id="title"
                placeholder="Enter title"
              />
            </div>
            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                class="form-control"
                id="description"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label for="price">Price</label>
              <input
                type="text"
                class="form-control"
                id="price"
                placeholder="Enter price"
              />
            </div>
            <div class="form-group form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="publishedOn"
              />
              <label class="form-check-label" for="publishedOn">
                Published On
              </label>
            </div>
            <button
              type="submit"
              class="btn btn-primary"
              onClick={createCourse}
            >
              CREATE
            </button>
          </form>
        </div>
        <div className="course-info">
          <h3>Delete course</h3>
          <form id="delete-course-form">
            <div class="form-group">
              <label for="id">ID</label>
              <input
                type="text"
                class="form-control"
                id="id"
                placeholder="Enter ID"
              />
            </div>
            <button
              type="submit"
              class="btn btn-primary"
              onClick={deleteCourse}
            >
              DELETE
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
