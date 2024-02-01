
require('overseer').setup({
    templates = { "builtin" },
    task_list = {
        width = 25,
        min_width = { 25 },
        max_width = { 50 },
        bindings = {
            ["<C-l>"] = false,
            ["<C-h>"] = false,
            ["o"] = false, -- defaults open
            ["q"] = false, -- defaults close
            ["r"] = "<CMD>OverseerQuickAction restart<CR>",
            ["e"] = "Edit",
        }
    },
    component_aliases = {
        default = {
          { "display_duration", detail_level = 2 },
          "on_output_summarize",
          "on_exit_set_status",
          "on_complete_notify",
          "on_complete_dispose",
        },
        default_vscode = {
          "default",
          "on_result_diagnostics",
          "on_result_diagnostics_quickfix",
        },
        myplugin = {
          "myplugin.restart_after",
        },
    },
})

vim.api.nvim_create_user_command("OverseerRestartLast", function()
  local overseer = require("overseer")
  local tasks = overseer.list_tasks({ recent_first = true })
  if vim.tbl_isempty(tasks) then
    vim.notify("No tasks found", vim.log.levels.WARN)
  else
    overseer.run_action(tasks[1], "restart")
  end
end, {})
