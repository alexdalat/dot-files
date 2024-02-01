
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

-- Copilot
vim.g.copilot_no_tab_map = true
vim.api.nvim_set_keymap("i", "<C-J>", 'copilot#Accept("<CR>")', { silent = true, expr = true })

local dap = require("dap")

wk.register({
    -- Telescope / Terminal
    t = {
        name = "Telescope / Terminal",
        v = { ':vsplit | wincmd l | terminal<CR>', 'Terminal (vertical)' },
        h = { ':split | wincmd j | terminal<CR>', 'Terminal (horizontal)' },

        f = { ':Telescope find_files<CR>', 'Find file' },
        b = { ':Telescope buffers<CR>', 'Find buffer' },
        H = { ':Telescope help_tags<CR>', 'Find help' },
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
            c = { dap.set_breakpoint, 'Set conditional breakpoint' },
            l = { ":lua require'dap'.set_breakpoint(nil, nil, vim.fn.input('Log point message: '))<CR>", 'Log point' },
            C = { dap.clear_breakpoints, 'Clear breakpoints' },
            L = { dap.list_breakpoints, 'List breakpoints' },
        },
        u = { ":lua require'dapui'.toggle()<CR>", 'Toggle UI' },
    },
    -- Task running / compilation
    b = {
        name = "Overseer",
        --l = { ":AsyncTaskLast<CR>", 'Last task' },
        --e = { ":AsyncTaskEdit<CR>", 'Edit tasks' },
        --L = { ":AsyncTaskList<CR>", 'List tasks' },
        --p = { ":AsyncTaskProfile debug release<CR>", 'Change build profile' },
        --s = { ":Telescope asynctasks all<CR>", 'Select Task' },
        --b = { ":AsyncTask build<CR>", 'Build (default)' },
        --r = { ":AsyncTask run<CR>", 'Execute (default)' },
        --P = { ":AsyncTask profile<CR>", 'Profile (default)' },
        R = { ":OverseerRun<CR>", 'Run' },
        t = { ":OverseerToggle<CR>", 'Toggle' },
        q = { ":OverseerQuickAction<CR>", 'Quick Action' },
        r = { ":OverseerQuickAction restart<CR>", 'Restart' },
        c = { ":OverseerBuild<CR>", 'Create Task' },
        b = {
            name = "Bundles",
            s = { ":OverseerSaveBundle<CR>", 'Save' },
            l = { ":OverseerLoadBundle<CR>", 'Load' },
            d = { ":OverseerDeleteBundle<CR>", 'Delete' },
        },
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

    -- Movement
    ["<C-h>"] = { '<C-w>h', 'Move left' },
    ["<C-j>"] = { '<C-w>j', 'Move down' },
    ["<C-k>"] = { '<C-w>k', 'Move up' },
    ["<C-l>"] = { '<C-w>l', 'Move right' },

    -- Resize
    ["<C-Right>"] = { '<C-w><', 'Decrease width' },
    ["<C-Up>"] = { '<C-w>-', 'Decrease height' },
    ["<C-Down>"] = { '<C-w>+', 'Increase height' },
    ["<C-Left>"] = { '<C-w>>', 'Increase width' },

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
                l = { ":lua vim.api.nvim_echo({{vim.inspect(vim.lsp.buf.list_workspace_folders())}}, false, {})<CR>", 'List workspace folders' },
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

