import { TodoList } from './todoList.js';
import { TodoStorage } from './todoStorage.js';
import { TodoUI } from './todoUI.js';
import { Statistics } from './statistics.js';
// import { ThemeManager } from './themeManager.js';

const storage = new TodoStorage();
const todoList = new TodoList(storage);
const statistics = new Statistics(todoList);
// const themeManager = new ThemeManager();
const ui = new TodoUI(todoList, statistics);

ui.initialize();