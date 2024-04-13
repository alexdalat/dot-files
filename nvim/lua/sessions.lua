
local function get_cwd_as_name()
  local dir = vim.fn.getcwd(0)
  return dir:gsub("[^A-Za-z0-9]", "_")
end

local overseer = require("overseer")


require('mini.sessions').setup({
  -- File for local session (use `''` to disable)
  file = ".svim",

  -- Directory where global sessions are stored (use `''` to disable)
  directory = "~/.config/nvim/sessions",

  hooks = {
    post = {
      write = function()
        overseer.save_task_bundle(
          get_cwd_as_name(),
          -- Passing nil will use config.opts.save_task_opts. You can call list_tasks() explicitly and
          -- pass in the results if you want to save specific tasks.
          nil,
          { on_conflict = "overwrite" } -- Overwrite existing bundle, if any
        )
        vim.notify("Saved tasks to session", "info", { title = "Overseer" })
      end,
      read = function()
        -- Dispose all tasks and load the new ones
        for _, task in ipairs(overseer.list_tasks({})) do
          task:dispose(true)
        end
        overseer.load_task_bundle(get_cwd_as_name(), { ignore_missing = true })
        vim.notify("Loaded tasks from session", "info", { title = "Overseer" })
      end,
    },
    pre = {
      write = function()
        -- Close overseer window using nvim command
        vim.cmd(":OverseerClose")
      end,
    },
  },

})
