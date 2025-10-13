// const inputBox = document.getElementById("input-box");
// const listContainer = document.getElementById("list-container");

// function addTask(){
//     if(inputBox.value === '')
//     {
//         alert("you must write something");
//     }        
//     else{
//         let li = document.createElement("li");
//         li.innerHTML = inputBox.value;
//         listContainer.appendChild(li);
//         let span = document.createElement("span");
//         span.innerHTML = "\u00d7";
//         li.appendChild(span);
//     }
//     inputBox.value = "";
//     saveData()
// }

// listContainer.addEventListener("click", function(e){
//     if(e.target.tagName === "LI")
//     {
//         e.target.classList.toggle("checked");
//         saveData()
//     }
//     else if (e.target.tagName === "SPAN"){
//         e.target.parentElement.remove();
//         saveData()
//     }
// }, false);

// function saveData(){
//     localStorage.setItem("data", listContainer.innerHTML);
// }

// function showTask(){
//     listContainer.innerHTML = localStorage.getItem("data");
// }
// showTask();

// frontend/script.js
const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

// Helper fetch wrapper to include cookies
async function api(path, opts = {}) {
  const res = await fetch(`https://advanced-todo-list-4.onrender.com${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  if(res.status === 401) {
    // not logged in -> redirect to login
    window.location.href = 'login.html';
    throw new Error('Unauthorized');
  }
  return res;
}

async function loadTasks(){
  try {
    const res = await api('/api/tasks', { method: 'GET' });
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (err) {
    console.error(err);
  }
}

function renderTasks(tasks){
  listContainer.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.dataset.id = task._id;
    li.textContent = task.text;
    if(task.completed) li.classList.add('checked');

    const span = document.createElement('span');
    span.innerHTML = '\u00d7';
    li.appendChild(span);

    // toggle completed by clicking LI
    li.addEventListener('click', async (e) => {
      if(e.target.tagName === 'SPAN') return; // avoid toggling when deleting
      try {
        await api(`/api/tasks/${task._id}`, {
          method: 'PUT',
          body: JSON.stringify({ completed: !task.completed })
        });
        await loadTasks();
      } catch (err) { console.error(err); }
    });

    // delete
    span.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        await api(`/api/tasks/${task._id}`, { method: 'DELETE' });
        await loadTasks();
      } catch (err) { console.error(err); }
    });

    listContainer.appendChild(li);
  });
}

async function addTask(){
  if(inputBox.value.trim() === '') {
    alert("you must write something");
    return;
  }
  try {
    await api('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ text: inputBox.value.trim() })
    });
    inputBox.value = '';
    await loadTasks();
  } catch (err) {
    console.error(err);
  }
}

// wire up button: if your Add button uses onclick="addTask()", keep that
window.addTask = addTask; // for inline onclick in index.html

// on load
loadTasks();
