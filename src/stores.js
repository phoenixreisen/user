const engine = require('store/src/store-engine');

const persistent = [
	require('store/storages/localStorage'),
	require('store/storages/cookieStorage'),
	require('store/storages/sessionStorage'),
	require('store/storages/memoryStorage'),
];

const session = [
	require('store/storages/sessionStorage'),
	require('store/storages/memoryStorage'),
];

const plugins = [
    require('store/plugins/defaults'),
    require('store/plugins/expire'),
	require('store/plugins/update'),
];

const Session = engine.createStore(session, plugins);
const Browser = engine.createStore(persistent, plugins);

if(typeof module !== 'undefined') {
	module.exports = { 
		Session, 
		Browser 
	};
}