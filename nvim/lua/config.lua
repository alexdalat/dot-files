
require('guess-indent').setup {}

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

vim.notify = require("notify")

-- vim.notify("Hello world.", "info", {
--     title = "Hello",
--     timeout = 5000,
--     icon = "",
-- })
