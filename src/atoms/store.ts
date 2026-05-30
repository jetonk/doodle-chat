import { createStore } from 'jotai';

export const store = createStore();
export type AppStore = typeof store;
