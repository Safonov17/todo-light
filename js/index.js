'use strict'
//==========================================
import {
	createUniqueId,
	getTaskFromLS,
	setTaskToLS,
	updateTasksList,
	initSortableList
} from './utils.js'

const form = document.querySelector('.form')
const textareaForm = document.querySelector('.form__textarea')
const buttonSendForm = document.querySelector('.form__send-btn')
const buttonCancel = document.querySelector('.form__cancel-btn')
const output = document.querySelector('.output')
let editId = null
let isEditTask = false

updateTasksList() // Самый первый рендер задач
textareaForm.focus()

// LISTENERS
form.addEventListener('submit', sendTask)
buttonCancel.addEventListener('click', resetSendForm)
output.addEventListener('dragover', initSortableList)
output.addEventListener('dragenter', evt => evt.preventDefault())
textareaForm.addEventListener('keydown', evt => {
	if (evt.key === 'Enter') {
		evt.preventDefault()
		sendTask(evt)
	}
})
output.addEventListener('click', evt => {
	// Проверка на клик по блоку с кнопками
	if (!evt.target.closest('.task__btns')) return

	// Проверка на клик на конкретную кнопку
	if (evt.target.closest('.task__done')) {
		taskDone(evt)
	} else if (evt.target.closest('.task__pinned')) {
		taskPinned(evt)
	} else if (evt.target.closest('.task__edit')) {
		taskEdit(evt)
	} else if (evt.target.closest('.task__del')) {
		taskDel(evt)
	}
})

// FUNCTIONS
function sendTask(evt) {
	evt.preventDefault()
	const task = textareaForm.value.trim().replace('/s+/g', ' ')
	if (!task) return alert('Поле не должно быть пустым')

	if (isEditTask) {
		saveEditedTask(task)
		return
	}

	const arrayTasks = getTaskFromLS()
	arrayTasks.push({
		id: createUniqueId(),
		task,
		done: false,
		pinned: false,
		position: 1000
	})

	setTaskToLS(arrayTasks)
	updateTasksList()
	form.reset()
	textareaForm.focus()
}

function taskDone(evt) {
	const task = evt.target.closest('.task')
	const taskId = task.dataset.taskId
	const arrayTasks = getTaskFromLS()
	const index = arrayTasks.findIndex(task => task.id === taskId)

	if (index === -1) return alert('Такой задачи не найдено')

	if (arrayTasks[index].done && arrayTasks[index].pinned) {
		return (arrayTasks[index].pinned = false)
	}

	if (arrayTasks[index].done) {
		arrayTasks[index].done = false
	} else {
		arrayTasks[index].done = true
	}

	setTaskToLS(arrayTasks)
	updateTasksList()
}

function taskPinned(evt) {
	const task = evt.target.closest('.task')
	const taskId = task.dataset.taskId
	const arrayTasks = getTaskFromLS()
	const index = arrayTasks.findIndex(task => task.id === taskId)

	if (index === -1) return alert('Такой задачи не найдено')

	if (arrayTasks[index].done && !arrayTasks[index].pinned) {
		return alert(
			'Чтобы закрепить задачу, необходимо снять отметку о ее выполнении'
		)
	}

	if (arrayTasks[index].pinned) {
		arrayTasks[index].pinned = false
	} else {
		arrayTasks[index].pinned = true
	}

	setTaskToLS(arrayTasks)
	updateTasksList()
}

function taskEdit(evt) {
	const task = evt.target.closest('.task')
	const text = task.querySelector('.task__text')
	editId = task.dataset.taskId

	textareaForm.value = text.textContent
	isEditTask = true
	buttonSendForm.textContent = 'Сохранить'
	buttonCancel.classList.remove('none')
	form.scrollIntoView({ behavior: 'smooth' })
}

function taskDel(evt) {
	const task = evt.target.closest('.task')
	const taskId = task.dataset.taskId
	const arrayTasks = getTaskFromLS()
	const newArrayTasks = arrayTasks.filter(task => task.id !== taskId)

	setTaskToLS(newArrayTasks)
	updateTasksList()
}

function saveEditedTask(task) {
	const arrayTasks = getTaskFromLS()
	const editedTaskIndex = arrayTasks.findIndex(task => task.id === editId)

	if (editedTaskIndex !== -1) {
		arrayTasks[editedTaskIndex].task = task
		setTaskToLS(arrayTasks)
		updateTasksList()
	} else alert('Такая задача не найдена')

	resetSendForm()
}

function resetSendForm() {
	editId = null
	isEditTask = false
	buttonSendForm.textContent = 'Добавить'
	buttonCancel.classList.add('none')
	form.reset()
}
