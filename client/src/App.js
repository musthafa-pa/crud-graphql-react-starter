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

function App() {
  const [courses, setCourses] = useState();
  const { data } = useQuery(COURSES);

  useEffect(() => {
    if (data) {
      setCourses(data.getCourses);
    }
  }, [data]);

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
        <div className="create-course"></div>
        <div className="course-info"></div>
      </div>
    </div>
  );
}

export default App;
