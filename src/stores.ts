import engine from 'store/src/store-engine';

import localStorage from 'store/storages/localStorage';
import cookieStorage from 'store/storages/cookieStorage';
import sessionStorage from 'store/storages/sessionStorage';

import defaults from 'store/plugins/defaults';
import expire from 'store/plugins/expire';
import update from 'store/plugins/update';

const persistent = [
	localStorage,
	cookieStorage
];

const session = [
	sessionStorage
];

const plugins = [
	defaults,
	expire,
	update
];

export const Session = engine.createStore(session, plugins);
export const Browser = engine.createStore(persistent, plugins);

export default {
	Session,
	Browser
}