;(function () {
    // check if localstorage is available
    function storageAvailable(type) {
        var storage;
        try {
            storage = window[type];
            var x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch (e) {
            return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                (storage && storage.length !== 0);
        }
    }

    if (!storageAvailable('localStorage')) {
        alert("no localStorage for use! Export after codeing please!")
    }
})();

/**
 * Saves the state of the workspace to browser's local storage.
 * @param {Blockly.Workspace} workspace Blockly workspace to save.
 * @param name project name to save
 */
function save(workspace, name) {
    const codes = Blockly.serialization.workspaces.save(workspace);
    window.localStorage?.setItem(name, JSON.stringify(codes));
}

/**
 * Loads saved state from local storage into the given workspace.
 * @param {Blockly.Workspace} workspace Blockly workspace to load into.
 * @param name project name to load
 */
function load(workspace, name) {
    const codes = window.localStorage?.getItem(name);
    if (codes) {
        Blockly.Events.disable();
        Blockly.serialization.workspaces.load(JSON.parse(codes), workspace, false);
        Blockly.Events.enable();
        return true;
    }
    return false;
}

function getDateStr() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // e.g. "2023-07-30"
}