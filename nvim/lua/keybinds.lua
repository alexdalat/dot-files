
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
}, { prefix = "<leader>", mode = {"n", "v"}, noremap = true, silent = true })

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
        c = { "require'dap'.continue()", 'Continue' },
        t = { "require'dap'.terminate()", 'Terminate' },
        cc = { "require'dap'.run_last()", 'Run last' },
        s = { "require'dap'.step_over()", 'Step over' },
        i = { "require'dap'.step_into()", 'Step into' },
        o = { "require'dap'.step_out()", 'Step out' },
        b = {
            name = "Breakpoints",
            b = { "require'persistent-breakpoints.api'.toggle_breakpoint()", 'Toggle breakpoint' },
            B = { "require'persistent-breakpoints.api'.set_conditional_breakpoint()", 'Set conditional breakpoint' },
            l = { "require'dap'.set_breakpoint(nil, nil, vim.fn.input('Log point message: '))", 'Log point' },
            c = { "require'dap'.clear_breakpoints()", 'Clear breakpoints' },
        },
        u = { "require'dapui'.toggle()", 'Toggle UI' },
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

}, { prefix = "<leader>", mode = "n", noremap = true, silent = true })


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

}, { mode = "n", noremap = true, silent = true })


-- LSP mappings for buffer-local
vim.api.nvim_create_autocmd('LspAttach', {
    group = vim.api.nvim_create_augroup('UserLspConfig', {}),
    callback = function(ev)
        local o = { buffer = ev.buf, noremap = true, silent = true }
        local lsp_mappings = {
            gD = { vim.lsp.buf.declaration, 'Declaration' },
            gd = { vim.lsp.buf.definition, 'Definition' },
            gr = { vim.lsp.buf.references, 'References' },
            gi = { vim.lsp.buf.implementation, 'Implementation' },
            gt = { vim.lsp.buf.type_definition, 'Type definition' },
            gs = { vim.lsp.buf.signature_help, 'Signature help' },
            K = { vim.lsp.buf.hover, 'Hover' },
            ca = { vim.lsp.buf.code_action, 'Code action', mode = { 'n', 'v' } },
            rn = { vim.lsp.buf.rename, 'Rename' },
            wa = { vim.lsp.buf.add_workspace_folder, 'Add workspace folder' },
            wr = { vim.lsp.buf.remove_workspace_folder, 'Remove workspace folder' },
            wl = { function()
                print(vim.inspect(vim.lsp.buf.list_workspace_folders()))
            end, 'List workspace folders' },
            F = { function()
                vim.lsp.buf.format { async = true }
            end, 'Format' },
        }
        wk.register(lsp_mappings, o)
    end,
})

