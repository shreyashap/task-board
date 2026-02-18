import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    user: { email: string } | null;
    isAuthenticated: boolean;
    rememberMe: boolean;
}

const getInitialState = (): AuthState => {
    if (typeof window === 'undefined') return { user: null, isAuthenticated: false, rememberMe: false };

    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    const userStr = storage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    return {
        user,
        isAuthenticated: !!user,
        rememberMe,
    };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state: AuthState, action: PayloadAction<{ email: string; rememberMe: boolean }>) => {
            state.user = { email: action.payload.email };
            state.isAuthenticated = true;
            state.rememberMe = action.payload.rememberMe;

            if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
                const storage = action.payload.rememberMe ? localStorage : sessionStorage;
                storage.setItem('user', JSON.stringify(state.user));
                localStorage.setItem('rememberMe', action.payload.rememberMe ? 'true' : 'false');
            }
        },
        logout: (state: AuthState) => {
            state.user = null;
            state.isAuthenticated = false;
            state.rememberMe = false;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
                sessionStorage.removeItem('user');
                localStorage.removeItem('rememberMe');
            }
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
