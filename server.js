/*********************************************************************************
*  WEB700 – Assignment 5
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Padmapriya PalaniSwamiNathan Student ID: 140193237 Date: 05-JUl-2024
*  Vercel : https://vercel.com/padmapriya-palaniswaminathans-projects/assignment4
*           https://assignment4-kappa-one.vercel.app/
*
********************************************************************************/ 
const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser"); // Import body-parser module
const collegeData = require("./modules/collegeData");
const exphbs = require('express-handlebars');
//const Handlebars = require('handlebars');

module.exports=app;

// Middleware route to serve JSON files from the "data" folder
app.use(express.static(path.join(__dirname, 'data')));
// Middleware route to serve static files from the "views" folder
app.use(express.static(path.join(__dirname, 'views')));
// Middleware route to serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Configure body-parser middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));


app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));    
    next();
});

app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
    navLink: function(url, options){
        return '<li' + 
            ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
            '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    },
    empty: function (context) {
        return (context.length === 0 || context === undefined || context === null);
    },
    ifEquals: function(a, b, options) {
        if (a === b) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    }}
}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views')); 

// Setup routes to serve HTML files
// GET / route for Home Page
app.get('/', function(req, res) {
    res.render("home") ;// Renders home.hbs view
});
// GET /about route for About Page
app.get('/about', function(req, res) {
    res.render("about") ;// Renders about.hbs view
});
// GET /htmlDemo route for Demo Page
app.get('/htmlDemo', function(req, res) {
    res.render("htmlDemo") ;// Renders htmlDemo.hbs view
});
// GET /students/add route for Add Student Page
app.get('/students/add', function(req, res) {
    res.render("addstudent") ;// Renders addstudent.hbs view
});


// Setup routes for JSON data
// GET /students route for Students
app.get('/students', (req, res) => {
    if (req.query.course) {
        collegeData.getStudentsByCourse(parseInt(req.query.course)).then((data) => {
            res.render("students", {students: data});
        }).catch((err) => {
            res.render("students", {message: "no results"});
        });
    } else {
        collegeData.getAllStudents().then((data) => {
            res.render("students", {students: data});
        }).catch((err) => {
            res.render("students", {message: "no results"});
        });
    }
});

// GET /courses route for Courses
app.get('/courses', (req, res) => {
    collegeData.getCourses().then((data) => {
        res.render("courses", {courses: data});
    }).catch((err) => {
        res.render("courses", {message: "no results"});
    });
});

// GET /course/:id route for Course by courseID
app.get('/course/:id', (req, res) => {
    collegeData.getCourseById(req.params.id).then((data) => {
        res.render("course", { course: data });
    }).catch((err) => {
        res.render("course", { message: "no results for course" });
    });
});

app.get('/student/:num', (req, res) => {
    const studentNum = req.params.num;

    // Fetch student data
    collegeData.getStudentByNum(studentNum).then((studentData) => {
        // Fetch all courses
        return collegeData.getCourses().then((coursesData) => {
            res.render("student", {
                student: studentData,
                courses: coursesData // Pass courses data to the template
            });
        });
    }).catch((err) => {
        res.render("student", {message: "no results"});
    });
});


// Handle POST request to add a student
app.post('/students/add', (req, res) => {
    let courseId = parseInt(req.body.enrolledCourse);
    collegeData.addStudent(req.body,courseId)
        .then(() => {
            res.redirect('/students'); // Redirect to the students page after adding student
        })
        .catch(err => {
            console.error('Error adding student:', err);
            // Handle error appropriately, e.g., render an error page or redirect to an error route
            res.status(500).send('Error adding student');
        });
});
// Handle POST request to update a student
app.post("/student/update", (req, res) => {
    console.log("Form data received:", req.body);
    req.body.studentNum = parseInt(req.body.studentNum, 10); // Ensure studentNum is a number
    req.body.TA = req.body.TA === "on"; // Handle checkbox data
    console.log("Parsed studentNum:", req.body.studentNum);

    collegeData.updateStudent(req.body)
        .then(() => {
            res.redirect("/students");
        })
        .catch(err => {
            console.error("Error updating student:", err);
            res.status(500).send("Error updating student");
        });
});

// Handle 404 errors for non-matching routes
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});


// Initialize the data and start the server
collegeData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("Server listening on port: " + HTTP_PORT);
    });
}).catch((err) => {
    console.log("Failed to initialize data: " + err);
});
