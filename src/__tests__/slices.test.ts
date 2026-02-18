import { describe, it, expect, beforeEach, vi } from 'vitest';
import authReducer, { login, logout } from '../store/authSlice';
import taskReducer, { addTask, deleteTask, moveTask } from '../store/taskSlice';

describe('Redux Slices', () => {
    describe('Auth Slice', () => {
        it('should handle login with rememberMe: true', () => {
            const initialState = { user: null, isAuthenticated: false, rememberMe: false };
            const action = login({ email: 'intern@demo.com', rememberMe: true });
            const state = authReducer(initialState, action);

            expect(state.isAuthenticated).toBe(true);
            expect(state.user?.email).toBe('intern@demo.com');
            expect(state.rememberMe).toBe(true);
            expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({ email: 'intern@demo.com' }));
        });

        it('should handle login with rememberMe: false', () => {
            const initialState = { user: null, isAuthenticated: false, rememberMe: false };
            const action = login({ email: 'intern@demo.com', rememberMe: false });
            const state = authReducer(initialState, action);

            expect(state.isAuthenticated).toBe(true);
            expect(state.rememberMe).toBe(false);
            expect(sessionStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({ email: 'intern@demo.com' }));
        });

        it('should handle logout', () => {
            const initialState = { user: { email: 'test@test.com' }, isAuthenticated: true, rememberMe: true };
            const state = authReducer(initialState, logout());

            expect(state.isAuthenticated).toBe(false);
            expect(state.user).toBeNull();
            expect(localStorage.removeItem).toHaveBeenCalledWith('user');
            expect(sessionStorage.removeItem).toHaveBeenCalledWith('user');
        });
    });

    describe('Task Slice', () => {
        it('should handle adding a task', () => {
            const initialState = { tasks: [], logs: [], searchQuery: '', filterPriority: 'All' as any, sortBy: 'due-date' as any };
            const newTask = { title: 'Test Task', description: 'Test Desc', priority: 'High' as any, dueDate: '2023-12-31', tags: ['bug'], column: 'Todo' as any };
            const state = taskReducer(initialState, addTask(newTask));

            expect(state.tasks).toHaveLength(1);
            expect(state.tasks[0].title).toBe('Test Task');
            expect(state.logs).toHaveLength(1);
            expect(state.logs[0].action).toBe('created');
        });

        it('should handle moving a task', () => {
            const initialState = {
                tasks: [{ id: '1', title: 'T1', description: '', priority: 'Low' as any, dueDate: '', tags: [], column: 'Todo' as any, createdAt: '' }],
                logs: [], searchQuery: '', filterPriority: 'All' as any, sortBy: 'due-date' as any
            };
            const state = taskReducer(initialState, moveTask({ id: '1', column: 'Doing' }));

            expect(state.tasks[0].column).toBe('Doing');
            expect(state.logs[0].action).toBe('moved');
        });

        it('should handle deleting a task', () => {
            const initialState = {
                tasks: [{ id: '1', title: 'T1', description: '', priority: 'Low' as any, dueDate: '', tags: [], column: 'Todo' as any, createdAt: '' }],
                logs: [], searchQuery: '', filterPriority: 'All' as any, sortBy: 'due-date' as any
            };
            const state = taskReducer(initialState, deleteTask('1'));

            expect(state.tasks).toHaveLength(0);
            expect(state.logs[0].action).toBe('deleted');
        });
    });
});
