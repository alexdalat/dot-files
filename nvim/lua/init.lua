-- keybinds
local wk = require("which-key")

-- Guess Indent
require('guess-indent').setup {}

-- Catppuccin
require("catppuccin").setup({
  flavour = "macchiato",
  integrations = {
    cmp = true,
    neotree = true,
    treesitter = true,
    notify = true,
  }
})
vim.cmd.colorscheme "catppuccin"

-- disable auto commenting new lines
vim.cmd("autocmd BufEnter * set formatoptions-=cro")
vim.cmd("autocmd BufEnter * setlocal formatoptions-=cro")

-- notify
vim.notify = require("notify")
-- vim.notify("Hello world.", "info", {
--     title = "Hello",
--     timeout = 5000,
--     icon = "",
-- })

--require('gitsigns').setup()  -- resides in %s column, shows line git status

-- statuscol
local builtin = require("statuscol.builtin")
require("statuscol").setup({
  segments = {
    {
      text = { builtin.foldfunc, " " },  -- fold
      condition = { true, builtin.not_empty },
      click = "v:lua.ScFa"
    },
    { text = { "%s" }, click = "v:lua.ScSa" },  -- git line
    {
      text = { builtin.lnumfunc, " " },  -- line number
      condition = { true, builtin.not_empty },
      click = "v:lua.ScLa",
    }
  },
})


-- Dashboard
local starter = require('mini.starter')
starter.setup({
  items = {
    starter.sections.telescope(),
  },
  content_hooks = {
    starter.gen_hook.adding_bullet(),
    starter.gen_hook.aligning('center', 'center'),
  },
})


-- Mini starter
local status, starter = pcall(require, "mini.starter")
if not status then
  return
end

local footer_n_seconds = function()
  --local timer = vim.loop.new_timer()
  --timer:start(0, 1000, vim.schedule_wrap(function()
  --  if vim.bo.filetype ~= 'starter' then
  --    timer:stop()
  --    return
  --  end
  --  --starter.refresh() -- messes with cursor
  --end))

  return function()
    return os.date("%A, %B %d, %Y %I:%M:%S %p")
  end
end

starter.setup({
  content_hooks = {
    starter.gen_hook.adding_bullet(""),
    starter.gen_hook.aligning("center", "center"),
  },
  evaluate_single = true,
  footer = footer_n_seconds(),
  header = table.concat({
    [[  /\ \▔\___  ___/\   /\- _ __ ___  ]],
    [[ /  \/ / _ \/ _ \ \ / / | '_ ` _ \ ]],
    [[/ /\  /  __/ (_) \ V /| | | | | | |]],
    [[\_\ \/ \___|\___/ \_/ |_|_| |_| |_|]],
    [[───────────────────────────────────]],
  }, "\n"),
  query_updaters = [[abcdefghilmoqrstuvwxyz0123456789_-,.ABCDEFGHIJKLMOQRSTUVWXYZ]],
  items = {
    -- Use this if you set up 'mini.sessions'
    starter.sections.sessions(5, true),
    --{ action = "tab G", name = "G: Fugitive", section = "Git" },
    { action = "Telescope find_files", name = "F: Find File", section = "Telescope" },
    { action = "Telescope grep_string", name = "G: Grep String", section = "Telescope" },
    { action = "PlugInstall", name = "U: Update Plugins", section = "Plugins" },
    { action = "enew",        name = "E: New Buffer",     section = "Builtin actions" },
    { action = "qall!",       name = "Q: Quit Neovim",    section = "Builtin actions" },
  },
})

vim.cmd([[
  augroup MiniStarterJK
    au!
    au User MiniStarterOpened nmap <buffer> j <Cmd>lua MiniStarter.update_current_item('next')<CR>
    au User MiniStarterOpened nmap <buffer> k <Cmd>lua MiniStarter.update_current_item('prev')<CR>
    au User MiniStarterOpened nmap <buffer> <C-p> <Cmd>Telescope find_files<CR>
  augroup END
]])


-- todo-comments
local td = require('todo-comments')
td.setup{}

wk.register({
  T = {
    name = "Todo Comments",
    n = { function() td.jump_next() end, "Next" },
    p = { function() td.jump_prev() end, "Prev" },
    T = { ":TodoTelescope keywords=TODO,FIX<CR>", "Todo Telescope" },
    N = { ":TodoTelescope keywords=NOTE<CR>", "Note Telescope" },
  },
}, { prefix = "<leader>", mode = "n" })

