-- Key binds

vim.g.mapleader = ','

local default_opts = { silent = true }

-- Copy to clipboard
vim.api.nvim_set_keymap('n', '<leader>y', '"+y', default_opts)
vim.api.nvim_set_keymap('v', '<leader>y', '"+y', default_opts)

-- Copy line without line break
vim.api.nvim_set_keymap('n', '<leader>Y', '"+yg_', default_opts)
vim.api.nvim_set_keymap('v', '<leader>Y', '"+yg_', default_opts)

-- Paste from clipboard
vim.api.nvim_set_keymap('n', '<leader>p', '"+p', default_opts)
vim.api.nvim_set_keymap('v', '<leader>p', '"+p', default_opts)

-- Save
vim.keymap.set('n', '<C-s>', ':w<CR>', default_opts)
-- File navigation
vim.keymap.set('n', '<leader>f', ':Neotree<CR>', default_opts)
vim.keymap.set('n', '<C-p>', ":lua require('fzf-lua').files()<CR>", default_opts)
-- Terminal
vim.keymap.set('n', '<leader>t', ':vsplit | wincmd l | terminal<CR>', default_opts)
vim.keymap.set('n', '<leader>th', ':split | wincmd j | terminal<CR>', default_opts)
-- Split tabs with <leader>s
vim.keymap.set('n', '<leader>sh', ':split<CR>', default_opts)
vim.keymap.set('n', '<leader>sv', ':vsplit<CR>', default_opts)
-- Switch tabs with Ctrl + <hjkl>
vim.keymap.set('n', '<C-j>', '<C-w>j', default_opts)
vim.keymap.set('n', '<C-k>', '<C-w>k', default_opts)
vim.keymap.set('n', '<C-h>', '<C-w>h', default_opts)
vim.keymap.set('n', '<C-l>', '<C-w>l', default_opts)




-- Debugging
local dap_bindings = {
    dc = "require'dap'.continue()",
    dcc = "require'dap'.run_last()",
    -- dr = "require'dap'.repl.toggle()",
    ds = "require'dap'.step_over()",
    di = "require'dap'.step_into()",
    ["do"] = "require'dap'.step_out()",
    db = "require'persistent-breakpoints.api'.toggle_breakpoint()",
    dbb = "require'persistent-breakpoints.api'.set_conditional_breakpoint()",
    dbl = "require'dap'.set_breakpoint(nil, nil, vim.fn.input('Log point message: '))",
    dbc = "require'dap'.clear_breakpoints()",
    dt = "require'dap'.terminate()",
    du = "require'dapui'.toggle()",
}

for k, v in pairs(dap_bindings) do
    vim.keymap.set('n', '<leader>' .. k, ':lua ' .. v .. '<CR>', default_opts)
end

-- Task running / compilation
local task_bindings = {
    bb = "AsyncTask build",
    bB = "AsyncTask build-release",
    br = "AsyncTask run",
    be = "AsyncTaskEdit",
}

for k, v in pairs(task_bindings) do
    vim.keymap.set('n', '<leader>' .. k, ':' .. v .. '<CR>', default_opts)
end





vim.keymap.set('n', '<leader>e', vim.diagnostic.open_float)
vim.keymap.set('n', '[d', vim.diagnostic.goto_prev)
vim.keymap.set('n', ']d', vim.diagnostic.goto_next)
-- vim.keymap.set('n', '<leader>q', vim.diagnostic.setloclist)

-- only map after the language server attaches to the current buffer
vim.api.nvim_create_autocmd('LspAttach', {
    group = vim.api.nvim_create_augroup('UserLspConfig', {}),
    callback = function(ev)
        -- Enable completion triggered by <c-x><c-o>
        vim.bo[ev.buf].omnifunc = 'v:lua.vim.lsp.omnifunc'

        -- Buffer local mappings.
        local opts = { buffer = ev.buf }
        vim.keymap.set('n', 'gD', vim.lsp.buf.declaration, opts)
        vim.keymap.set('n', 'gd', vim.lsp.buf.definition, opts)
        vim.keymap.set('n', 'gr', vim.lsp.buf.references, opts)
        vim.keymap.set('n', 'gi', vim.lsp.buf.implementation, opts)
        vim.keymap.set('n', 'gt', vim.lsp.buf.type_definition, opts)
        vim.keymap.set('n', 'K', vim.lsp.buf.hover, opts)
        vim.keymap.set({ 'n', 'v' }, '<leader>ca', vim.lsp.buf.code_action, opts)
        vim.keymap.set('n', '<leader>rn', vim.lsp.buf.rename, opts)
        vim.keymap.set('n', '<leader>wa', vim.lsp.buf.add_workspace_folder, opts)
        vim.keymap.set('n', '<leader>wr', vim.lsp.buf.remove_workspace_folder, opts)
        vim.keymap.set('n', '<leader>wl', function()
            print(vim.inspect(vim.lsp.buf.list_workspace_folders()))
        end, opts)
        vim.keymap.set('n', '<leader>F', function()
            vim.lsp.buf.format { async = true }
        end, opts)
        vim.keymap.set('n', '<C-k>', vim.lsp.buf.signature_help, opts)
    end,
})
