const path = require("path");
const fs = require("fs");

class Data{
    constructor(students, courses){
        this.students = students;
        this.courses = courses;
    }
}

let dataCollection = null;
const coursePath = path.resolve(__dirname, '../data', 'courses.json');
const studentPath = path.resolve(__dirname, '../data', 'students.json');
//Initializting the student and courses data via json files
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        const coursePath = path.resolve(__dirname, '../data', 'courses.json');
        const studentPath = path.resolve(__dirname, '../data', 'students.json');

        console.log("Course Path: ", coursePath);  // Debugging log
        console.log("Student Path: ", studentPath);  // Debugging log

        fs.readFile(coursePath, 'utf8', (err, courseData) => {
            if (err) {
                console.error("Failed to load courses:", err);
                reject("unable to load courses");
                return;
            }

            fs.readFile(studentPath, 'utf8', (err, studentData) => {
                if (err) {
                    console.error("Failed to load students:", err);
                    reject("unable to load students");
                    return;
                }

                dataCollection = new Data(JSON.parse(studentData), JSON.parse(courseData));
                console.log("Data initialized successfully");
                resolve();
            });
        });
    });
};
//Get all student data
module.exports.getAllStudents = function(){
    return new Promise((resolve,reject)=>{
        if (dataCollection.students.length == 0) {
            reject("query returned 0 results"); 
            return;
        }

        resolve(dataCollection.students);
    })
}
//Get all courses data
module.exports.getCourses = function(){
   return new Promise((resolve,reject)=>{
    if (dataCollection.courses.length == 0) {
        reject("query returned 0 results"); return;
    }

    resolve(dataCollection.courses);
   });
};

// Get course data by CourseID
module.exports.getCourseById = function(id){
    return new Promise((resolve, reject) => {
        const course = dataCollection.courses.find(c => c.courseId == id);
        
        if (!course) {
            reject("query returned 0 results");
            return;
        }

        resolve(course);
    });
};

//Get all student data by student number
module.exports.getStudentByNum = function (num) {
    return new Promise(function (resolve, reject) {
        var foundStudent = null;

        for (let i = 0; i < dataCollection.students.length; i++) {
            if (dataCollection.students[i].studentNum == num) {
                foundStudent = dataCollection.students[i];
            }
        }

        if (!foundStudent) {
            reject("query returned 0 results"); return;
        }

        resolve(foundStudent);
    });
};
//Get all student data by course number
module.exports.getStudentsByCourse = function (course) {
    return new Promise(function (resolve, reject) {
        var filteredStudents = [];

        for (let i = 0; i < dataCollection.students.length; i++) {
            if (dataCollection.students[i].course == course) {
                filteredStudents.push(dataCollection.students[i]);
            }
        }

        if (filteredStudents.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(filteredStudents);
    });
};
//Add new student data using form data
module.exports.addStudent = function (student,courseId) {
    return new Promise((resolve, reject) => {
        if (!student || typeof student !== 'object') {
            reject("Invalid student data");
            return;
        }

        if (!courseId || typeof courseId !== 'number') {
            reject("Invalid course ID");
            return;
        }

        // Generate a unique student number (example: increment last student number)
        let newStudentNum =  dataCollection.students.length + 1;

        if (!courseId || student.TA== 'on') {
            var TAvalue = true
        }


        // Create a new student object with provided data and course ID
        let newStudent = {
            studentNum: newStudentNum,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            addressStreet: student.addressStreet,
            addressCity: student.addressCity,
            addressProvince: student.addressProvince,
            TA: TAvalue || false,
            status: student.status,
            course: parseInt(courseId)

        };

        // Add the new student to the collection
        dataCollection.students.push(newStudent);

       /*const studentPath = path.resolve(__dirname, '../data', 'students.json');
        // Save updated student data to file (assuming students.json)
        fs.writeFile(studentPath, JSON.stringify(dataCollection.students, null, 2), (err) => {
            if (err) {
                reject("Error saving student data");
                return;
            }
            resolve(newStudent);
        });
        */
        resolve(newStudent);
    });
};

// Update student data
module.exports.updateStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        let student = dataCollection.students.find(s => s.studentNum == studentData.studentNum);

        if (student) {
            // Overwrite the student data
            student.firstName = studentData.firstName;
            student.lastName = studentData.lastName;
            student.email = studentData.email;
            student.addressStreet = studentData.addressStreet;
            student.addressCity = studentData.addressCity;
            student.addressProvince = studentData.addressProvince;
            student.TA = (studentData.TA) ? true : false;
            student.status = studentData.status;
            student.course = parseInt(studentData.enrolledCourse); // Ensure it's stored as an integer

            resolve();
        } else {
            reject(`No student found with studentNum: ${studentData.studentNum}`);
        }
    });
};

