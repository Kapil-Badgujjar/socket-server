const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createActivityAttempt } = require('./services/activity-attempts');
const { updateQuizStatus } = require('./services/quiz');
const { createLeaderboards } = require('./services/leaderboard');
const { createOrUpdateQuizAttempt, updateQuizAttemptScore } = require('./services/quiz-attempt');
const { updateStudent } = require('./services/student');

const app = express();
const port = 8090;

// ---------------------------------------------------------------------------------------------------------------------------

// Create a new Map
const activeQuizzes = new Map();
const leaderboardMap = new Map();

// Function to get an array of objects by key, or create a new array if it doesn't exist
function getArrayByKeyOrCreate(key) {
  if (!leaderboardMap.has(key)) {
    leaderboardMap.set(key, []);
  }
  return leaderboardMap.get(key);
}

// Function to sort the array of students by coins in descending order
function sortStudentsByCoins(array) {
  array.sort((a, b) => b.coins - a.coins);
}

// Function to add or update a student object and keep the array sorted by coins
function addOrUpdateStudent(key, studentId, username, xp, coins) {
  const array = getArrayByKeyOrCreate(key);
  const studentIndex = array.findIndex(student => student.studentId === studentId);

  if (studentIndex !== -1) {
    array[studentIndex].xp += xp;
    array[studentIndex].coins += coins;
  } else {
    // Student does not exist, add new student
    array.push({ studentId, username, xp, coins });
  }
  
  // Sort the array after adding or updating
  sortStudentsByCoins(array);
}

async function clearData(quizId) {
    try{
        const leaderboard = leaderboardMap.get(quizId)
        Array.isArray(leaderboard) && leaderboard.forEach((item)=> {updateQuizAttemptScore(quizId, item.studentId, item.xp); updateStudent(item.studentId, item.coins, item.xp)});
        Array.isArray(leaderboard) && createLeaderboards(quizId,leaderboard)
        updateQuizStatus(quizId, "Closed"); 
        activeQuizzes.delete(quizId);
        leaderboardMap.delete(quizId);
    } catch (error){
        console.log("Error clearing data:", error);
    }
}

// Create an HTTP server
const server = http.createServer(app);

// Integrate socket.io with the HTTP server
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins. Adjust this as needed for your security requirements.
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});


// ------------------------------------------------------------------------------------------------------


// Use CORS middleware
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Define a simple route
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

io.on('connection', (socket) => {
    socket.on('getEndTime', (data) =>
    {
        socket.emit('quizEndTime', { endTime: activeQuizzes.get(data.quizId) });
        leaderboardMap.has(data.quizId) && io.emit("leaderboardUpdated", {quizId:data.quizId, leaderboard: leaderboardMap.get(data.quizId)});
    })
    socket.on("answer", async (data) => {
        try{
            addOrUpdateStudent(data.quizId, data.studentId, data.username, data.isCleared ? 100:10, data.isCleared ? data.timeTaken < 29 ? Math.round((30-data.timeTaken) * 5): 5:0 );
            const response = leaderboardMap.has(data.quizId) ? await createActivityAttempt(data) : null;
            const qa_response = leaderboardMap.has(data.quizId) ? await createOrUpdateQuizAttempt(data.quizId, data.studentId, data.taskNumber ):null;
            leaderboardMap.has(data.quizId) && io.emit("leaderboardUpdated", {quizId:data.quizId, leaderboard: leaderboardMap.get(data.quizId)});
        } catch(e){
            console.log(e);
        }
    });

    socket.on("start", async (data) => {
        const response = await updateQuizStatus(data.quizId, "Unlocked");
        activeQuizzes.set(data.quizId, (Date.now() + data.quizOpenTime*60000));
        setTimeout(()=>{clearData(data.quizId)},data.quizOpenTime*60000);
        io.emit("quizStarted", {quizId:data.quizId, endTime: activeQuizzes.get(data.quizId)});
    });

    socket.on("close", async(data) => {
        // implement on close functionality
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
