
-- Key binds
vim.g.mapleader = ','


-- Copilot
vim.g.copilot_no_tab_map = true
vim.api.nvim_set_keymap("i", "<C-J>", 'copilot#Accept("<CR>")', { silent = true, expr = true })


-- Which-key
local wk = require("which-key")
wk.setup()

-- Leader, n+v
wk.register({
    -- Copy and Paste
    y = { '"+y', 'Copy to clipboard' },
    Y = { '"+yg_', 'Copy line without line break' },
}, { prefix = "<leader>", mode = {"n", "v"}, noremap = true, silent = false })

-- Leader, n
wk.register({
    -- Telescope / Terminal
    t = {
        name = "Telescope / Terminal",
        v = { ':vsplit | wincmd l | terminal<CR>', 'Terminal (vert)' },
        h = { ':split | wincmd j | terminal<CR>', 'Terminal (horiz)' },
    },
    -- Split tabs
    s = {
        name = "Split",
        h = { ':split<CR>', 'Split horizontal' },
        v = { ':vsplit<CR>', 'Split vertical' },
    },
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
    ["<C-Right>"] = { '<C-w>>', 'Increase width' },
    ["<C-Up>"] = { '<C-w>+', 'Increase height' },
    ["<C-Down>"] = { '<C-w>-', 'Decrease height' },
    ["<C-Left>"] = { '<C-w><', 'Decrease width' },

}, { mode = "n", noremap = true, silent = false })

