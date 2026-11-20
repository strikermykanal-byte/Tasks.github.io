
const addBtn = document.getElementById("addBtn");
const inp = document.getElementById("inp");
const taskList = document.querySelector("#task-list");
const dateInput = document.getElementById("task-date");

// Modal удаления
const modal = document.querySelector("#modal-overlay");
const cancelBtn = document.querySelector("#canc");
const confirmBtn = document.querySelector("#conf");

// Modal редактирования
const editModal = document.querySelector("#edit-overlay");
const editInput = document.querySelector("#edit-input");
const editCancelBtn = document.querySelector("#edit-canc");
const editSaveBtn = document.querySelector("#edit-save");

const STORAGE_KEY = "toDoTask";

let taskIdToDelete = null;
let taskIdToEdit = null;


// Получение задач
const getTasks = () => {
    try {
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];

        return tasks.filter(item =>
            item &&
            typeof item.data === "string" &&
            item.data.trim()
        );
    } catch {
        return [];
    }
};


// Сохранение задач
const setTasks = (tasks) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};


// Получение сегодняшней даты
const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


// Форматирование даты
const formatDate = (date) => {
    const [year, month, day] = date.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
};


// Добавление задачи в localStorage
const saveTask = (text) => {
    const tasks = getTasks();

    tasks.push({
        id: Date.now(),
        data: text,
        createdAt: new Date().toISOString(),
        dueDate: dateInput.value
    });

    setTasks(tasks);

    inp.value = "";
    dateInput.value = "";

    displayData();
};


// Проверка и добавление задачи
const addTask = () => {
    const value = inp.value.trim();

    if (!value) {
        alert("Введите задачу!");
        return;
    }

    if (!dateInput.value) {
        alert("Выберите дату!");
        return;
    }

    saveTask(value);
};


// Обработчик кнопки добавления
if (addBtn) {
    addBtn.addEventListener("click", addTask);
}


// Добавление задачи по Enter
if (inp) {
    inp.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            addTask();
        }
    });
}


// Удаление задачи
const removeTask = (id) => {
    const tasks = getTasks();
    const updatedTasks = tasks.filter(item => item.id !== id);

    setTasks(updatedTasks);
    displayData();
};


// Открытие окна редактирования
const updateItem = (id, oldText) => {
    taskIdToEdit = id;

    editInput.value = oldText;
    editModal.style.display = "flex";

    editInput.focus();
};


// Закрытие окна редактирования
if (editCancelBtn) {
    editCancelBtn.addEventListener("click", () => {
        editModal.style.display = "none";
        taskIdToEdit = null;
    });
}


// Сохранение изменений
if (editSaveBtn) {
    editSaveBtn.addEventListener("click", () => {
        const newText = editInput.value.trim();

        if (!newText) {
            alert("Введите текст задачи!");
            return;
        }

        const tasks = getTasks();

        const updatedTasks = tasks.map(item => {
            if (item.id === taskIdToEdit) {
                return {
                    ...item,
                    data: newText
                };
            }

            return item;
        });

        setTasks(updatedTasks);

        editModal.style.display = "none";
        taskIdToEdit = null;

        displayData();
    });
}


// Открытие окна удаления
const openDeleteModal = (id) => {
    taskIdToDelete = id;
    modal.style.display = "flex";
};


// Закрытие окна удаления
if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
        modal.style.display = "none";
        taskIdToDelete = null;
    });
}


// Подтверждение удаления
if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
        if (taskIdToDelete !== null) {
            removeTask(taskIdToDelete);
        }

        modal.style.display = "none";
        taskIdToDelete = null;
    });
}


// Отображение задач
const displayData = () => {
    if (!taskList) return;

    const tasks = getTasks();
    const today = getToday();
    const page = document.body.dataset.page;

    let visibleTasks = tasks;

    // Фильтрация для страницы Today
    if (page === "today") {
        visibleTasks = tasks.filter(item => item.dueDate === today);
    }

    taskList.innerHTML = "";

    visibleTasks.forEach(item => {
        const li = document.createElement("li");

        const taskContent = document.createElement("div");
        taskContent.classList.add("task-content");

        const span = document.createElement("span");
        span.textContent = item.data;

        const date = document.createElement("p");
        date.classList.add("task-date");
        date.textContent = item.dueDate
            ? formatDate(item.dueDate)
            : "Без даты";

        const editButton = document.createElement("button");
        
        
        const editIcon = document.createElement("i");
        
        editIcon.classList.add("fa-solid", "fa-pen");
        
        editButton.append(editIcon);

        editButton.addEventListener("click", () => {
            updateItem(item.id, item.data);
        });

        const deleteButton = document.createElement("button");
        
        const deleteIcon = document.createElement("i");
        
        deleteIcon.classList.add("fa-solid", "fa-trash");
        
        deleteButton.append(deleteIcon);
        
        deleteButton.addEventListener("click", () => {
            openDeleteModal(item.id);
        });

        taskContent.append(span, date);
        li.append(taskContent, editButton, deleteButton);

        taskList.append(li);
    });
};


// Первоначальная загрузка задач
displayData();
