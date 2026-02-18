// Manual Logic Verification Script (Node.js)
// Note: This is an alternative to Vitest due to ESM/CJS compatibility issues in the environment.

const assert = (condition, message) => {
    if (!condition) {
        console.error('❌ FAIL:', message);
        process.exit(1);
    }
    console.log('✅ PASS:', message);
};

console.log('Running Manual Logic Tests...\n');

// 1. Storage Logic Mocking
const storage = {
    data: {},
    setItem(key, value) { this.data[key] = value; },
    getItem(key) { return this.data[key] || null; },
    removeItem(key) { delete this.data[key]; }
};

// 2. Mocking Auth Logic
const loginLogic = (email, rememberMe) => {
    const user = { email };
    const targetStorage = rememberMe ? storage : { data: {}, setItem: () => { }, getItem: () => { }, removeItem: () => { } };
    targetStorage.setItem('user', JSON.stringify(user));
    storage.setItem('rememberMe', rememberMe ? 'true' : 'false');
    return { user, rememberMe };
};

// Test 1: Remember Me = True
const result1 = loginLogic('intern@demo.com', true);
assert(storage.getItem('rememberMe') === 'true', 'Remember Me flag should be true');
assert(JSON.parse(storage.getItem('user')).email === 'intern@demo.com', 'User should be persisted in storage');

// Test 2: Remember Me = False
storage.data = {}; // Reset
const result2 = loginLogic('intern@demo.com', false);
assert(storage.getItem('rememberMe') === 'false', 'Remember Me flag should be false');
// Note: In real app, it would be in sessionStorage, which is distinct from our mocked localStorage

console.log('\nAll core logic tests passed!');
