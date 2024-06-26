
local dap = require('dap')
local util = require('utils')

-- Keybinds --

---- dap-ui ----
-- edit: e
-- expand: Enter
-- open: o
-- remove: d
-- repl: r
-- toggle: t
----------------

local wk = require("which-key")

wk.register({
     d = {
        name = "Debug",
        c = { dap.continue, 'Continue' },
        C = { dap.run_last, 'Run last' },
        t = { dap.terminate, 'Terminate' },
        s = { dap.step_over, 'Step over' },
        i = { dap.step_into, 'Step into' },
        o = { dap.step_out, 'Step out' },
        b = {
            name = "Breakpoints",
            --b = { ":lua require'persistent-breakpoints.api'.toggle_breakpoint()<CR>", 'Toggle breakpoint' },
            --B = { ":lua require'persistent-breakpoints.api'.set_conditional_breakpoint()<CR>", 'Set conditional breakpoint' },
            b = { dap.toggle_breakpoint, 'Toggle breakpoint' },
            l = { function() util.text_input(function(log_msg) dap.set_breakpoint(nil, nil, log_msg) end, "Log message: ", "x: {x}") end, 'Log point' },
            C = { dap.clear_breakpoints, 'Clear breakpoints' },
            L = { dap.list_breakpoints, 'List breakpoints' },
        },
        u = { ":lua require'dapui'.toggle()<CR>", 'Toggle UI' },
    },
}, { prefix = "<leader>", mode = {"n", "v"}, noremap = true, silent = true })

-- End keybinds --



--- nvim-dap
dap.defaults.fallback.focus_terminal = true  -- can also be added to individual configs

local function find_lldb_vscode()
    local paths = { -- paths to be searched for the debugger installation
        '/usr/lib/llvm-14/bin/lldb-vscode',
        '/opt/homebrew/opt/llvm/bin/lldb-vscode',
    }

    for _, path in ipairs(paths) do
        local file = io.open(path, "r")
        if file then
            file:close()
            return path
        end
    end
    return nil
end

dap.adapters.lldb = {
    type = 'executable',
    command = find_lldb_vscode(), -- must be absolute path
    name = 'lldb'
}

if not dap.adapters.lldb.command then
    vim.notify('LLDB not found', vim.log.levels.WARN)
else
    --vim.notify('LLDB found at ' .. dap.adapters.lldb.command, vim.log.levels.INFO)
end

dap.configurations.cpp = {
    {
        name = 'Launch',
        type = 'lldb',
        request = 'launch',
        program = function()
            return vim.fn.input('Path to executable: ', vim.fn.getcwd() .. '/', 'file')
        end,
        cwd = '${workspaceFolder}',
        stopOnEntry = false,
        args = {},
        runInTerminal = true, -- necessary for interactive console
        showDisassembly = "never",
    },
}

dap.configurations.c = dap.configurations.cpp
dap.configurations.rust = dap.configurations.cpp


--- nvim-dap-ui
local dapui = require("dapui")
dapui.setup()

-- Auto open and close dapui
dap.listeners.after.event_initialized["dapui_config"] = function()
    --dapui.open()
end
dap.listeners.before.event_terminated["dapui_config"] = function()
    dapui.close()
end
dap.listeners.before.event_exited["dapui_config"] = function()
    dapui.close()
end

-- Dependency for nvim-dap-ui
require("neodev").setup({
    library = { plugins = { "nvim-dap-ui" }, types = true },
})

---@diagnostic disable-next-line: missing-fields
require 'nvim-treesitter.configs'.setup {
    ensure_installed = { "cpp", "lua", "vim", "vimdoc", "python", "bash", "json", "yaml", "html", "css", "javascript" },
    sync_install = true,

    -- Recommendation: set to false if you don't have `tree-sitter` CLI installed locally
    auto_install = false,
    ignore_install = {},

    highlight = {
        enable = true,

        -- NOTE: these are the names of the parsers and not the filetype.
        disable = { "c", "rust" },
    },
}

require("nvim-dap-virtual-text").setup {
    enabled = true,
    highlight_changed_variables = true,
    highlight_new_as_changed = false, -- highlight new variables in the same way as changed variables
    show_stop_reason = true,
    commented = false,
    only_first_definition = false, -- only show virtual text at first definition (if there are multiple)
    all_references = true,         -- show virtual text on all all references of the variable (not only definitions)
    clear_on_continue = false,     -- clear virtual text on "continue" (might cause flickering when stepping)

    ---@diagnostic disable-next-line: unused-local
    display_callback = function(variable, buf, stackframe, node, options)
        if options.virt_text_pos == 'inline' then
            return ' = ' .. variable.value
        else
            return variable.name .. ' = ' .. variable.value
        end
    end,
    virt_text_pos = vim.fn.has 'nvim-0.10' == 1 and 'inline' or 'eol',

    -- experimental features:
    all_frames = false,     -- show virtual text for all stack frames not only current. Only works for debugpy(?)
    virt_lines = false,     -- show virtual lines instead of virtual text (will flicker!)
    virt_text_win_col = nil -- position the virtual text at a fixed window column
}

--require('persistent-breakpoints').setup {
--    save_dir = vim.fn.stdpath('data') .. '/nvim_checkpoints',
--    load_breakpoints_event = "BufReadPost",
--}


