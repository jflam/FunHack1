var console = null;
var rafael = null;
var editor = null;
var html = null;
var language = "javascript";

///////////////////////////////////////////////////////////////////////////////////////////////////
// Github integration
//  - support for Github API

// TODO: how do we keep this a secret?
var git_user_name = "jflam";
var git_password = "fMKKU1NfZY4wwoG";
var git_api_token = "f478586eb00c38be01522daed9fc86fa";

git_make_authenticated_call = function(call, success_callback) {
    var auth_hash = Base64.encode(git_user_name + ':' + git_password);
    var auth_header = "Basic " + auth_hash

    $.ajax({url: call,
            method: 'GET',
            beforeSend: function(req) {
                req.setRequestHeader('Authorization', auth_header);
            },
            success: success_callback
            });
}

git_get_starred_gists = function() {
    var git_get_starred_gists_api = "https://api.github.com/gists/starred";
    git_make_authenticated_call(git_get_starred_gists_api, 
        function(data, text_status, xhr) {
            alert(data[0])
        });
}

git_get_gist = function(id, filename) {
    var git_get_gist_api = "https://api.github.com/gists/" + id;
    git_make_authenticated_call(git_get_gist_api, 
        function(data, text_status, xhr) {
            var code = data.files[filename].content;
            editor.getSession().setValue(code);
        });
}

git_fork_gist = function(id) {
    var git_fork_gist_api = "https://api.github.com/" + id + "/fork";
    git_make_authenticated_call(git_fork_gist_api,
        function(data, text_status, xhr) {
            // TODO: assert that we got a 201 response code
        });
}

// TODO: we need a better instance_eval style function in JS -- need to get a
// consult on how to do this correctly with JS guys.
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

///////////////////////////////////////////////////////////////////////////////////////////////////
// Ace editor support

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

switch_language = function(new_language) {
    language = new_language;
}

// Execute code based on what the currently selected language is
execute_code = function(code) {
    if (language == "coffeescript") {
    }
    else {
    }
}

execute_selection = function(env, args, request) {
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
        } else {
            editor.insert("\r\n");
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
            execute_selection(env, args, request);
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
    canon.addCommand({
        name: 'switch_coffeescript',
        bindKey: { 
            win: 'Ctrl-K',
            mac: 'Ctrl-K',
            sender: 'editor'
        },
        exec: function(env, args, request) {
            switch_language("coffeescript");
        }
    });
    canon.addCommand({
        name: 'switch_javascript',
        bindKey: { 
            win: 'Ctrl-J',
            mac: 'Ctrl-J',
            sender: 'editor'
        },
        exec: function(env, args, request) {
            switch_language("javascript");
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
    git_get_gist("265480", "Raphael-vertical-text-alignment-test-wheel.js");
}
