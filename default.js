var console = null;
var rafael = null;
var editor = null;
var html = null;

instance_eval = (function () {
    var $ = {};
    return function (str) {
        try {
            return eval(str);
        }
        catch (e) {
            return e;
        }
    }
})();

// This toggles between the three different output windows
show_output = function(id) {
    var top = id * 700;
    var output = document.getElementById("output");
    output.scrollTop = top;
}

// Helper functions for the interactive console
cls = function() {
    console.getSession().setValue("");
}

print = function(str) {
    console.navigateFileEnd();
    console.insert("\n" + str);
}

dir = function(obj) {
    for (key in obj) {
        print(key);
    }
}

execute_selection = function(editor, env, args, request) {
    var doc = editor.getSession().doc;
    var selection = editor.getSelectionRange();
    var code = null;
    if (selection.isEmpty()) {
        // Note that we handle the non-selection case specially.
        // First we see if we are at the end of the line, if so we run the code on the current line.
        // If we are not at the end of the line, CTRL-ENTER will move to the end of the line. This has
        // the effect of always executing the code on the line after two consecutive CTRL-ENTERS.
        var s = editor.getSelection();
        var p1 = s.getCursor();
        s.moveCursorLineEnd();
        var p2 = s.getCursor();
        if (p1.column === p2.column) {
            code = doc.getLine(p1.row);
        }
    } else {
        code = doc.getTextRange(selection);
    }
    if (code !== null) {
        var result = instance_eval(code);
        // insert the output below the end of the selection
        var pos = editor.selection.getRange().end;
        editor.clearSelection();
        editor.selection.moveCursorToPosition(pos);
        if (result !== null && result !== undefined) {
            if (typeof(result) === "function") {
                editor.insert("\r\n//> created function(s)\r\n");
            } else {
                editor.insert("\r\n//> " + result.toString() + "\r\n");
            }
        }
    }
}

init_editor = function() {
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/vibrant_ink");
    
    var JavaScriptMode = require("ace/mode/javascript").Mode;
    editor.getSession().setMode(new JavaScriptMode());
    editor.renderer.setHScrollBarAlwaysVisible(false);

    var canon = require('pilot/canon')
    canon.addCommand({
        name: 'execute',
        bindKey: { 
            win: 'Ctrl-Return',
            mac: 'Ctrl-Return',
            sender: 'editor'
        },
        exec: function(env, args, request) {
            execute_selection(editor, env, args, request);
        }
    });
    canon.addCommand({
        name: 'show_rafael',
        bindKey: { 
            win: 'Ctrl-1',
            mac: 'Ctrl-1',
            sender: 'editor'
        },
        exec: function(env, args, request) {
            show_output(0);
        }
    });
    canon.addCommand({
        name: 'show_console',
        bindKey: { 
            win: 'Ctrl-2',
            mac: 'Ctrl-2',
            sender: 'editor'
        },
        exec: function(env, args, request) {
            show_output(1);
        }
    });
    canon.addCommand({
        name: 'show_html1',
        bindKey: { 
            win: 'Ctrl-3',
            mac: 'Ctrl-3',
            sender: 'editor'
        },
        exec: function(env, args, request) {
            show_output(2);
        }
    });
}

init_rafael = function() {
    rafael = Raphael("rafael");
}

init_console = function() {
    console = ace.edit("console");
    console.setTheme("ace/theme/vibrant_ink");
    console.setShowPrintMargin(false);
    console.renderer.setHScrollBarAlwaysVisible(false);
}

init_html = function() {
    html = document.getElementById("html1");
    html.innerHTML = "<h1>change me!</h1>";
}

window.onload = function() {
    init_editor();
    init_rafael();
    init_console();
    init_html();
}
