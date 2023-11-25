
-- Key binds
vim.g.mapleader = ','

-- Which-key
require("which-key").setup()

local wk = require("which-key")

-- Define the key mappings and their descriptions
wk.register({
    -- Copy and Paste
    y = {
        name = "Copy", -- group name
        y = { '"+y', 'Copy to clipboard' },
        Y = { '"+yg_', 'Copy line without line break' },
    },
}, { prefix = "<leader>", mode = {"n", "v"}, noremap = true, silent = false })

local dap = require('dap')

wk.register({
    -- Telescope / Terminal
    t = {
        name = "Telescope / Terminal",
        v = { ':vsplit | wincmd l | terminal<CR>', 'Terminal (vertical)' },
        h = { ':split | wincmd j | terminal<CR>', 'Terminal (horizontal)' },

        f = { ':Telescope find_files<CR>', 'Find file' },
        b = { ':Telescope buffers<CR>', 'Find buffer' },
        h = { ':Telescope help_tags<CR>', 'Find help' },
        g = { ':Telescope live_grep<CR>', 'Find string' },
    },
    -- Split tabs
    s = {
        name = "Split",
        h = { ':split<CR>', 'Split horizontal' },
        v = { ':vsplit<CR>', 'Split vertical' },
    },
    -- File
    f = { ':Neotree toggle<CR>', 'File navigation' },
    -- Debugging
    d = {
        name = "Debug",
        c = { ":lua require'dap'.continue()<CR>", 'Continue' },
        C = { ":lua require'dap'.run_last()<CR>", 'Run last' },
        t = { ":lua require'dap'.terminate()<CR>", 'Terminate' },
        s = { ":lua require'dap'.step_over()<CR>", 'Step over' },
        i = { ":lua require'dap'.step_into()<CR>", 'Step into' },
        o = { ":lua require'dap'.step_out()<CR>", 'Step out' },
        b = {
            name = "Breakpoints",
            b = { ":lua require'persistent-breakpoints.api'.toggle_breakpoint()<CR>", 'Toggle breakpoint' },
            B = { ":lua require'persistent-breakpoints.api'.set_conditional_breakpoint()<CR>", 'Set conditional breakpoint' },
            l = { ":lua require'dap'.set_breakpoint(nil, nil, vim.fn.input('Log point message: '))<CR>", 'Log point' },
            c = { ":lua require'dap'.clear_breakpoints()<CR>", 'Clear breakpoints' },
        },
        u = { ":lua require'dapui'.toggle()<CR>", 'Toggle UI' },
    },
    -- Task running / compilation
    b = {
        name = "Build/Run",
        b = { ":AsyncTask build<CR>", 'Build' },
        B = { ":AsyncTask build-release<CR>", 'Build release' },
        r = { ":AsyncTask run<CR>", 'Run' },
        e = { ":AsyncTaskEdit<CR>", 'Edit task' },
        p = { ":AsyncTask profile<CR>", 'Profile' },
    },
    -- Profiling
    p = {
        name = "Profile",
        l = {
            name = "Load",
            f = { ":PerfLoadFlat<CR>", 'Load flat profile' },
            g = { ":PerfLoadCallGraph<CR>", 'Load call graph' },
            o = { ":PerfLoadFlameGraph<CR>", 'Load flame graph' },
        },
        e = { ":PerfPickEvent<CR>", 'Pick event' },
        a = { ":PerfAnnotate<CR>", 'Annotate' },
        f = { ":PerfAnnotateFunction<CR>", 'Annotate function' },
        pa = { ":PerfAnnotateSelection<CR>", 'Annotate selection', mode = "v" },
        t = { ":PerfToggleAnnotations<CR>", 'Toggle annotations' },
        h = { ":PerfHottestLines<CR>", 'Hottest lines' },
        s = { ":PerfHottestSymbols<CR>", 'Hottest symbols' },
        c = { ":PerfHottestCallersFunction<CR>", 'Hottest callers function' },
        pc = { ":PerfHottestCallersSelection<CR>", 'Hottest callers selection', mode = "v" },
    },
    -- LSP
    e = { vim.diagnostic.open_float, 'Open diagnostics' },

}, { prefix = "<leader>", mode = "n", noremap = true, silent = false })


-- Non-leader
local tsb = require('telescope.builtin')
wk.register({
    ["[d"] = { vim.diagnostic.goto_prev, 'Previous diagnostic' },
    ["]d"] = { vim.diagnostic.goto_next, 'Next diagnostic' },

    ["<C-s>"] = { ':w<CR>', 'Save' },
    ["<C-p>"] = { tsb.find_files, 'Find file' },

    ["<C-h>"] = { '<C-w>h', 'Move left' },
    ["<C-j>"] = { '<C-w>j', 'Move down' },
    ["<C-k>"] = { '<C-w>k', 'Move up' },
    ["<C-l>"] = { '<C-w>l', 'Move right' },

}, { mode = "n", noremap = true, silent = false })


-- LSP mappings for buffer-local
vim.api.nvim_create_autocmd('LspAttach', {
    group = vim.api.nvim_create_augroup('UserLspConfig', {}),
    callback = function(ev)

        wk.register({
            F = { vim.lsp.buf.format, 'Format' },
            ca = { vim.lsp.buf.code_action, 'Code action', mode = { 'n', 'v' } },
            K = { vim.lsp.buf.hover, 'Hover' },
            rn = { vim.lsp.buf.rename, 'Rename' },
            w = {
                name = "Workspace",
                a = { vim.lsp.buf.add_workspace_folder, 'Add workspace folder' },
                r = { vim.lsp.buf.remove_workspace_folder, 'Remove workspace folder' },
                l = { print(vim.inspect(vim.lsp.buf.list_workspace_folders())), 'List workspace folders' },
            },
        }, { prefix = "<leader>", mode = 'n', noremap = true, silent = false, buffer = ev.buf })

        wk.register({
            g = {
                name = "Go to",
                D = { vim.lsp.buf.declaration, 'Declaration' },
                d = { vim.lsp.buf.definition, 'Definition' },
                r = { vim.lsp.buf.references, 'References' },
                i = { vim.lsp.buf.implementation, 'Implementation' },
                t = { vim.lsp.buf.type_definition, 'Type definition' },
                s = { vim.lsp.buf.signature_help, 'Signature help' },
            },
        }, { prefix = "<leader>", mode = { 'n', 'v' }, noremap = true, silent = false, buffer = ev.buf })
    end,
})

