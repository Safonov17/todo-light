import { doneSvg, pinnedSvg, delSvg, editSvg } from './svg.js'

export function getTaskFromLS() {
	const tasks = localStorage.getItem('tasks')
	return tasks ? JSON.parse(tasks) : []
}

export function setTaskToLS(tasks) {
	localStorage.setItem('tasks', JSON.stringify(tasks))
}

export function createUniqueId() {
	return Date.now() + '' + Math.random().toString(36).substring(7)
}

export function updateTasksList() {
	document.querySelector('.output').textContent = ''
	const arrayTasks = getTaskFromLS()
	renderTasks(arrayTasks)
}

export function initSortableList(evt) {
	evt.preventDefault()

	const output = document.querySelector('.output')
	const draggingItem = document.querySelector('.dragging')
	const siblings = [...output.querySelectorAll('.task:not(.dragging)')]
	let nextSibling = siblings.find(sibling => {
		return evt.clientY <= sibling.offsetTop + sibling.offsetHeight / 2
	})

	output.insertBefore(draggingItem, nextSibling)
}

function renderTasks(tasks) {
	if (!tasks || !tasks.length) return

	tasks
		.sort((a, b) => {
			if (a.done !== b.done) {
				return a.done ? 1 : -1
			}
			if (a.pinned !== b.pinned) {
				return a.pinned ? -1 : 1
			}
			return a.position - b.position
		})
		.forEach((value, i) => {
			const { id, task, pinned, done } = value
			const item = `
            <div class="task ${done ? 'done' : ''} ${
				pinned ? 'pinned' : ''
			}" data-task-id="${id}" draggable="true">
                <p class="task__text">${task}</p>
                <span class="task__index ${done ? 'none' : ''}">${i + 1}</span>
                <div class="task__btns">
                    <button class="task__done ${
											done ? 'active' : ''
										}">${doneSvg}</button>
                    <button class="task__pinned ${
											pinned ? 'active' : ''
										}">${pinnedSvg}</button>
                    <button class="task__edit">${editSvg}</button>
                    <button class="task__del">${delSvg}</button>
                </div>
            </div>
            `
			document.querySelector('.output').insertAdjacentHTML('beforeend', item)
		})

	activationDrag()
}

function activationDrag() {
	const tasks = [...document.querySelectorAll('.task')]
	tasks.forEach(task => {
		task.addEventListener('dragstart', () => {
			setTimeout(() => task.classList.add('dragging'), 0)
		})
		task.addEventListener('dragend', () => {
			task.classList.remove('dragging')
			tasks.length > 1 && savePositionTask()
		})

	})
}

function savePositionTask() {
	const arrayTasks = getTaskFromLS()
	const tasks = [...document.querySelectorAll('.task')]

	tasks.forEach((task, i) => {
		const taskId = task.dataset.taskId
		const index = arrayTasks.findIndex(task => task.id === taskId)

		if (index !== -1) arrayTasks[index].position = i
	})

	setTaskToLS(arrayTasks)
	updateTasksList()
}
