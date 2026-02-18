import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Priority = 'Low' | 'Medium' | 'High';
export type Column = 'Todo' | 'Doing' | 'Done';

export interface Task {
    id: string;
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
    tags: string[];
    column: Column;
    createdAt: string;
}

export interface ActivityLog {
    id: string;
    taskId: string;
    taskTitle: string;
    action: 'created' | 'edited' | 'moved' | 'deleted';
    timestamp: string;
}

interface TaskState {
    tasks: Task[];
    logs: ActivityLog[];
    searchQuery: string;
    filterPriority: Priority | 'All';
    sortBy: 'due-date' | 'created-at';
}

const getInitialTasks = (): Task[] => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved) : [];
    }
    return [];
};

const getInitialLogs = (): ActivityLog[] => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('activity_logs');
        return saved ? JSON.parse(saved) : [];
    }
    return [];
};

const initialState: TaskState = {
    tasks: getInitialTasks(),
    logs: getInitialLogs(),
    searchQuery: '',
    filterPriority: 'All',
    sortBy: 'due-date',
};

const persistData = (tasks: Task[], logs: ActivityLog[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('activity_logs', JSON.stringify(logs));
    }
};

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        addTask: (state: TaskState, action: PayloadAction<Omit<Task, 'id' | 'createdAt'>>) => {
            const newTask: Task = {
                ...action.payload,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            };
            state.tasks.push(newTask);
            state.logs.unshift({
                id: crypto.randomUUID(),
                taskId: newTask.id,
                taskTitle: newTask.title,
                action: 'created',
                timestamp: new Date().toISOString(),
            });
            persistData(state.tasks, state.logs);
        },
        updateTask: (state: TaskState, action: PayloadAction<{ id: string; updates: Partial<Task> }>) => {
            const index = state.tasks.findIndex((t: Task) => t.id === action.payload.id);
            if (index !== -1) {
                state.tasks[index] = { ...state.tasks[index], ...action.payload.updates };
                state.logs.unshift({
                    id: crypto.randomUUID(),
                    taskId: action.payload.id,
                    taskTitle: state.tasks[index].title,
                    action: 'edited',
                    timestamp: new Date().toISOString(),
                });
                persistData(state.tasks, state.logs);
            }
        },
        moveTask: (state: TaskState, action: PayloadAction<{ id: string; column: Column }>) => {
            const index = state.tasks.findIndex((t: Task) => t.id === action.payload.id);
            if (index !== -1) {
                state.tasks[index].column = action.payload.column;
                state.logs.unshift({
                    id: crypto.randomUUID(),
                    taskId: action.payload.id,
                    taskTitle: state.tasks[index].title,
                    action: 'moved',
                    timestamp: new Date().toISOString(),
                });
                persistData(state.tasks, state.logs);
            }
        },
        deleteTask: (state: TaskState, action: PayloadAction<string>) => {
            const task = state.tasks.find((t: Task) => t.id === action.payload);
            if (task) {
                state.logs.unshift({
                    id: crypto.randomUUID(),
                    taskId: task.id,
                    taskTitle: task.title,
                    action: 'deleted',
                    timestamp: new Date().toISOString(),
                });
                state.tasks = state.tasks.filter((t: Task) => t.id !== action.payload);
                persistData(state.tasks, state.logs);
            }
        },
        resetBoard: (state: TaskState) => {
            state.tasks = [];
            state.logs = [];
            persistData([], []);
        },
        setSearchQuery: (state: TaskState, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        setFilterPriority: (state: TaskState, action: PayloadAction<Priority | 'All'>) => {
            state.filterPriority = action.payload;
        },
        setSortBy: (state: TaskState, action: PayloadAction<'due-date' | 'created-at'>) => {
            state.sortBy = action.payload;
        },
    },
});

export const {
    addTask,
    updateTask,
    moveTask,
    deleteTask,
    resetBoard,
    setSearchQuery,
    setFilterPriority,
    setSortBy,
} = taskSlice.actions;

export default taskSlice.reducer;
