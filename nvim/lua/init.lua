
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


-- Task Management
vim.g.asynctasks_template = '~/.config/nvim/task_template.ini'

require('gitsigns').setup()

local builtin = require("statuscol.builtin")
require("statuscol").setup({
  -- Default segments (fold -> sign -> line number + separator), explained below
  segments = {
    { text = { "%C" }, click = "v:lua.ScFa" },
    { text = { "%s" }, click = "v:lua.ScSa" },
    {
      text = { builtin.lnumfunc, " " },
      condition = { true, builtin.not_empty },
      click = "v:lua.ScLa",
    }
  },
})
