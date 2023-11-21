
-- Guess Indent
require('guess-indent').setup {}

-- Catppuccin
require("catppuccin").setup({
    flavour = "mocha",
    integrations = {
        cmp = true,
        neotree = true,
        treesitter = true,
        notify = true,
    }
})
vim.cmd.colorscheme "catppuccin"

-- notify
vim.notify = require("notify")
-- vim.notify("Hello world.", "info", {
--     title = "Hello",
--     timeout = 5000,
--     icon = "",
-- })


-- Asynctasks
vim.g.asynctasks_template = '~/.config/nvim/task_template.ini'
