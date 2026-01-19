// Calendar Logic
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

let currentDate = new Date();

function renderCalendar() {
    const monthYearElement = document.getElementById('month-year');
    const calendarDaysElement = document.getElementById('calendar-days');

    // Clear previous days
    calendarDaysElement.innerHTML = '';

    // Set Header
    monthYearElement.innerText = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    // Get first day of the month
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Padding days (empty slots for days before the 1st)
    const startDayIndex = firstDay.getDay();

    for (let i = 0; i < startDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('day', 'empty');
        calendarDaysElement.appendChild(emptyDiv);
    }

    // Days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayDiv = document.createElement('div');
        dayDiv.innerText = i;
        dayDiv.classList.add('day');

        // Highlight today
        const today = new Date();
        if (i === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()) {
            dayDiv.classList.add('today');
        }

        // Highlight selected day
        dayDiv.addEventListener('click', () => {
            document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
            dayDiv.classList.add('selected');
        });

        calendarDaysElement.appendChild(dayDiv);
    }
}

// Navigation
document.getElementById('prev-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// --- Item Tracker Logic (Tasks, Notes, Voice) ---

// Elements
const itemList = document.getElementById('item-list');
const modeBtns = document.querySelectorAll('.mode-btn');
const inputGroups = document.querySelectorAll('.input-group');

// Inputs
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const noteInput = document.getElementById('note-input');
const addNoteBtn = document.getElementById('add-note-btn');
const recordBtn = document.getElementById('record-btn');
const stopBtn = document.getElementById('stop-btn');
const recordingStatus = document.getElementById('recording-status');

// State
let items = JSON.parse(localStorage.getItem('items')) || [];
let currentMode = 'task'; // task, note, voice
let mediaRecorder;
let audioChunks = [];

// Mode Switching
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update Buttons
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update Inputs
        currentMode = btn.dataset.mode;
        inputGroups.forEach(group => group.classList.remove('active'));
        if (currentMode === 'task') document.getElementById('task-input-container').classList.add('active');
        if (currentMode === 'note') document.getElementById('note-input-container').classList.add('active');
        if (currentMode === 'voice') document.getElementById('voice-input-container').classList.add('active');
    });
});

// Render Items
function renderItems() {
    itemList.innerHTML = '';
    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = `item-${item.type}`;
        if (item.completed) li.classList.add('completed');

        // Content
        const contentDiv = document.createElement('div');
        contentDiv.style.flex = '1';

        if (item.type === 'task') {
            const span = document.createElement('span');
            span.innerText = item.content;
            span.addEventListener('click', () => toggleItem(index));
            contentDiv.appendChild(span);
        } else if (item.type === 'note') {
            const span = document.createElement('span');
            span.innerText = item.content;
            contentDiv.appendChild(span);
        } else if (item.type === 'voice') {
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.src = item.content; // file path
            contentDiv.appendChild(audio);
        }

        // Actions
        const actionsDiv = document.createElement('div');

        if (item.type !== 'voice') {
            const editBtn = document.createElement('button');
            editBtn.innerText = '✎';
            editBtn.className = 'edit-btn';
            editBtn.addEventListener('click', () => editItem(index));
            actionsDiv.appendChild(editBtn);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = '×';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteItem(index);
        });
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(contentDiv);
        li.appendChild(actionsDiv);
        itemList.appendChild(li);
    });
}

// CRUD Operations
function addItem(type, content) {
    items.push({
        type,
        content,
        completed: false,
        date: new Date().toISOString()
    });
    saveItems();
    renderItems();
}

function deleteItem(index) {
    items.splice(index, 1);
    saveItems();
    renderItems();
}

function toggleItem(index) {
    if (items[index].type === 'task') {
        items[index].completed = !items[index].completed;
        saveItems();
        renderItems();
    }
}

function editItem(index) {
    const item = items[index];
    const newContent = prompt("Edit item:", item.content);
    if (newContent !== null && newContent.trim() !== "") {
        item.content = newContent.trim();
        saveItems();
        renderItems();
    }
}

function saveItems() {
    localStorage.setItem('items', JSON.stringify(items));
}

// Event Listeners - Task
addTaskBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    if (text) {
        addItem('task', text);
        taskInput.value = '';
    }
});
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const text = taskInput.value.trim();
        if (text) {
            addItem('task', text);
            taskInput.value = '';
        }
    }
});

// Event Listeners - Note
addNoteBtn.addEventListener('click', () => {
    const text = noteInput.value.trim();
    if (text) {
        addItem('note', text);
        noteInput.value = '';
    }
});

// Event Listeners - Voice
recordBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const arrayBuffer = await audioBlob.arrayBuffer();

            // Send to Main Process to save
            if (window.electronAPI && window.electronAPI.saveAudio) {
                const filePath = await window.electronAPI.saveAudio(arrayBuffer);
                addItem('voice', `file://${filePath}`);
            } else {
                alert("Electron API not available. Cannot save audio.");
            }

            recordingStatus.innerText = "";
            recordBtn.disabled = false;
            stopBtn.disabled = true;
            recordBtn.classList.remove('recording');
        };

        mediaRecorder.start();
        recordingStatus.innerText = "Recording...";
        recordBtn.disabled = true;
        stopBtn.disabled = false;
        recordBtn.classList.add('recording');

    } catch (err) {
        console.error("Error utilizing microphone:", err);
        alert("Could not access microphone.");
    }
});

stopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
});

// Legacy Migration (for previously saved tasks)
if (localStorage.getItem('tasks')) {
    const oldTasks = JSON.parse(localStorage.getItem('tasks'));
    oldTasks.forEach(t => {
        items.push({
            type: 'task',
            content: t.text,
            completed: t.completed,
            date: new Date().toISOString()
        });
    });
    localStorage.removeItem('tasks'); // Clear legacy
    saveItems();
}

// Initial Render
renderCalendar();
renderItems();
