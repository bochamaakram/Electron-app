// Calendar Logic
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

let currentDate = new Date(); // For calendar navigation
let selectedDate = new Date(); // For item filtering

// Utility: Get date string in YYYY-MM-DD format (ignoring time)
function getDateString(date) {
    return date.toISOString().split('T')[0];
}

// Utility: Check if a date is in the past (ignoring time)
function isPastDate(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
}

// Utility: Check if a date is in the future (ignoring time)
function isFutureDate(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate > today;
}

function renderCalendar() {
    const monthYearElement = document.getElementById('month-year');
    const calendarDaysElement = document.getElementById('calendar-days');

    calendarDaysElement.innerHTML = '';
    monthYearElement.innerText = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDayIndex = firstDay.getDay();

    // Padding days
    for (let i = 0; i < startDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('day', 'empty');
        calendarDaysElement.appendChild(emptyDiv);
    }

    // Days of the month
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayDiv = document.createElement('div');
        dayDiv.innerText = i;
        dayDiv.classList.add('day');

        const thisDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        thisDate.setHours(0, 0, 0, 0);

        // Highlight today
        if (thisDate.getTime() === today.getTime()) {
            dayDiv.classList.add('today');
        }

        // Gray out past days
        if (thisDate < today) {
            dayDiv.classList.add('past');
        }

        // Highlight selected day
        const selDate = new Date(selectedDate);
        selDate.setHours(0, 0, 0, 0);
        if (thisDate.getTime() === selDate.getTime()) {
            dayDiv.classList.add('selected');
        }

        // Click handler
        dayDiv.addEventListener('click', () => {
            selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            renderCalendar(); // Re-render to update selection
            renderItems();    // Filter items
            updateInputRestrictions();
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

const itemList = document.getElementById('item-list');
const modeBtns = document.querySelectorAll('.mode-btn');
const inputGroups = document.querySelectorAll('.input-group');

const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const noteInput = document.getElementById('note-input');
const addNoteBtn = document.getElementById('add-note-btn');
const recordBtn = document.getElementById('record-btn');
const stopBtn = document.getElementById('stop-btn');
const recordingStatus = document.getElementById('recording-status');

let items = JSON.parse(localStorage.getItem('items')) || [];
let currentMode = 'task';
let mediaRecorder;
let audioChunks = [];

// Mode Switching
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentMode = btn.dataset.mode;
        inputGroups.forEach(group => group.classList.remove('active'));
        if (currentMode === 'task') document.getElementById('task-input-container').classList.add('active');
        if (currentMode === 'note') document.getElementById('note-input-container').classList.add('active');
        if (currentMode === 'voice') document.getElementById('voice-input-container').classList.add('active');

        updateInputRestrictions();
    });
});

// Update input restrictions based on selectedDate
function updateInputRestrictions() {
    const isFuture = isFutureDate(selectedDate);
    const isPast = isPastDate(selectedDate);

    // Past dates: No additions allowed at all
    if (isPast) {
        addTaskBtn.disabled = true;
        taskInput.disabled = true;
        addTaskBtn.title = "Cannot add items to past dates";

        addNoteBtn.disabled = true;
        noteInput.disabled = true;
        addNoteBtn.title = "Cannot add items to past dates";

        recordBtn.disabled = true;
        recordBtn.title = "Cannot add items to past dates";
    }
    // Future dates: Only tasks allowed
    else if (isFuture) {
        addTaskBtn.disabled = false;
        taskInput.disabled = false;
        addTaskBtn.title = "";

        addNoteBtn.disabled = true;
        noteInput.disabled = true;
        addNoteBtn.title = "Notes cannot be added to future dates";

        recordBtn.disabled = true;
        recordBtn.title = "Voice notes cannot be added to future dates";
    }
    // Today: Everything allowed
    else {
        addTaskBtn.disabled = false;
        taskInput.disabled = false;
        addTaskBtn.title = "";

        addNoteBtn.disabled = false;
        noteInput.disabled = false;
        addNoteBtn.title = "";

        recordBtn.disabled = false;
        recordBtn.title = "";
    }
}

// Render Items - filtered by selectedDate
function renderItems() {
    itemList.innerHTML = '';
    const selectedDateStr = getDateString(selectedDate);

    const filteredItems = items.filter(item => {
        const itemDateStr = getDateString(new Date(item.date));
        return itemDateStr === selectedDateStr;
    });

    if (filteredItems.length === 0) {
        const emptyMsg = document.createElement('li');
        emptyMsg.className = 'empty-message';
        emptyMsg.innerText = 'No items for this date.';
        itemList.appendChild(emptyMsg);
        return;
    }

    filteredItems.forEach((item) => {
        const originalIndex = items.indexOf(item);
        const li = document.createElement('li');
        li.className = `item-${item.type}`;
        if (item.completed) li.classList.add('completed');

        const contentDiv = document.createElement('div');
        contentDiv.style.flex = '1';

        if (item.type === 'task') {
            const span = document.createElement('span');
            span.innerText = item.content;
            span.addEventListener('click', () => toggleItem(originalIndex));
            contentDiv.appendChild(span);
        } else if (item.type === 'note') {
            const span = document.createElement('span');
            span.innerText = item.content;
            contentDiv.appendChild(span);
        } else if (item.type === 'voice') {
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.src = item.content;
            contentDiv.appendChild(audio);
        }

        const actionsDiv = document.createElement('div');

        if (item.type !== 'voice') {
            const editBtn = document.createElement('button');
            editBtn.innerText = '✎';
            editBtn.className = 'edit-btn';
            editBtn.addEventListener('click', () => editItem(originalIndex));
            actionsDiv.appendChild(editBtn);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = '×';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteItem(originalIndex);
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
        date: selectedDate.toISOString() // Use selectedDate
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
    if (isFutureDate(selectedDate)) {
        alert("Notes cannot be added to future dates.");
        return;
    }
    const text = noteInput.value.trim();
    if (text) {
        addItem('note', text);
        noteInput.value = '';
    }
});

// Event Listeners - Voice
recordBtn.addEventListener('click', async () => {
    if (isFutureDate(selectedDate)) {
        alert("Voice notes cannot be added to future dates.");
        return;
    }
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

// Legacy Migration
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
    localStorage.removeItem('tasks');
    saveItems();
}

// Initial Render
renderCalendar();
renderItems();
updateInputRestrictions();
